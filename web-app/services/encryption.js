const jsrs = require('jsrsasign');
const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');
const chaincode = require('./fabric/chaincode');
const walletUtil = require('./fabric/wallet-utils');
const certificates = require('../database/models/certificates');

let ecdsa = new jsrs.ECDSA({'curve': 'secp256r1'});


/**
 * Generate merkle tree from certificate data using a pre-defined schema
 * @param {certificates} certData
 * @returns {Promise<MerkleTree>}
 */
async function generateMerkleTree(certData) {
    let certSchema = await chaincode.invokeChaincode("queryCertificateSchema",
        ["v1"], true, certData.universityEmail);

    let certDataArray = [];

    //certSchema used to order the certificate elements appropriately.
    //ordering[i] = key of i'th item that should go in the certificate array.
    for (let i = 0; i < certSchema.ordering.length ; i++) {
        let itemKey = certSchema.ordering[i];
        certDataArray.push(certData[itemKey]);
    }

    const mTreeLeaves = certDataArray.map(x => SHA256(x));
    const mTree = new MerkleTree(mTreeLeaves, SHA256);

    return mTree;
}

/**
 * Generate merkle tree root from certificate data using a pre-defined schema
 * @param {certificates} certData
 * @returns {Promise<string>}
 */
async function generateMerkleRoot(certData) {
    let mTree =  await generateMerkleTree(certData)
     return mTree.getRoot().toString('hex');
}

/**
 * Sign a String with a private key using Elliptic Curve Digital Signature Algorithm
 * @param stringToSign
 * @param signerEmail
 * @returns {Promise<String>}
 */
async function createDigitalSignature(stringToSign, signerEmail) {
    let hexKeyWallet = await walletUtil.loadHexKeysFromWallet(signerEmail);
    let signedData = ecdsa.signHex(stringToSign, hexKeyWallet.privateKey);
    return signedData;
}

/**
 * Map parameter names to their indexes in certificate ordering schema.
 * @param {String[]} paramsToShare - Name of parameters that are to be shared.
 * @param {String[]} ordering - Order of keys in merkle tree generation. Look at Schema.ordering in chaincode
 * @returns {int[]} Index oof the params to share based on schema ordering. Eg - [2,3]
 *
 * eg
 * Input, paramsToShare: ["departmentName", "cgpa"].
 * ordering: ["universityName", "major", "departmentName", "cgpa"]
 * Output: [2,3]
 *
 */
function getParamsIndexArray(paramsToShare, ordering){

    let paramsToShareIndex = paramsToShare.map( (element) => {
        return ordering.findIndex(
            (orderingElement) => {return orderingElement === element;}) });

    return paramsToShareIndex;
}


/**
 * Generate a merkleTree Proof object.
 * @param {String[]} paramsToShare - Name of parameters that are to be shared.
 * @param {String} certUUID
 * @param {String} studentEmail - Certiificate holder email. Used to invoke chaincode.
 * @returns {Promise<Buffer[]>} proofObject
 */
async function generateCertificateProof(paramsToShare, certUUID, studentEmail) {
    let certSchema = await chaincode.invokeChaincode("queryCertificateSchema",
        ["v1"], true, studentEmail);

    let certificateDBData = await certificates.findOne({"_id" : certUUID});

    let mTree = await generateMerkleTree(certificateDBData);

    //get the index or "ordering" of the data to share in the pre defined schema.
    let paramsToShareIndex = getParamsIndexArray(paramsToShare, certSchema.ordering);

    let multiProof = mTree.getMultiProof(mTree.getHexLayersFlat(), paramsToShareIndex);

    return multiProof;
}


/**
 * Verify Merkle Tree Proof
 * @param {Promise<Buffer[]>} mTreeProof
 * @param {Object} disclosedData - Key value pair containing the disclosed data. Eg - {"attributeName" : "attributeValue" }
 * @param {String} certUUID
 * @returns {Promise<boolean>}
 */
async function verifyCertificateProof(mTreeProof, disclosedData, certUUID) {
    let certSchema = await chaincode.invokeChaincode("queryCertificateSchema",
        ["v1"], true, "admin");
    let certificateDBData = await certificates.findOne({"_id" : certUUID});
    let mTree = await generateMerkleTree(certificateDBData);

    //Split disclosedData object into two separate key and value arrays.
    let disclosedDataParamNames = [];
    let disclosedDataValues = [];

    for(let x in disclosedData) {
        disclosedDataParamNames.push(x);
        disclosedDataValues.push(disclosedData[x]);
    }

    let paramsToShareIndex = getParamsIndexArray(disclosedDataParamNames, certSchema.ordering);

    let mTreeRoot = mTree.getRoot();
    let disclosedDataHash = disclosedDataValues.map(x => SHA256(x));
    //let verificationSuccess = mTree.verifyMultiProof(mTreeRoot, paramsToShareIndex, disclosedDataHash, mTree.getDepth(), mTreeProof );

    let verificationSuccess = mTree.verifyMultiProof(mTreeRoot, paramsToShareIndex, disclosedDataHash, mTree.getDepth(), mTreeProof);

    console.log("Verification status: " + verificationSuccess);
    return verificationSuccess;
}


module.exports = {generateMerkleRoot, createDigitalSignature, generateCertificateProof, verifyCertificateProof};