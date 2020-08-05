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

async function generateMerkleRoot(certData) {
    let mTree =  await generateMerkleTree(certData)
     return mTree.getRoot().toString('hex');
}

async function createDigitalSignature(stringToSign, signerEmail) {
    let hexKeyWallet = await walletUtil.loadHexKeysFromWallet(signerEmail);
    let signedData = ecdsa.signHex(stringToSign, hexKeyWallet.privateKey);
    return signedData;
}

function getParamsIndexArray(paramsToShare, ordering){

    let paramsToShareIndex = paramsToShare.map( (element) => {
        return ordering.findIndex(
            (orderingElement) => {return orderingElement === element;}) });

    return paramsToShareIndex;
}

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



//disclosed data is key value pair.



async function verifyCertificateProof(mTreeProof, disclosedData, certUUID) {
    let certSchema = await chaincode.invokeChaincode("queryCertificateSchema",
        ["v1"], true, "admin");
    let certificateDBData = await certificates.findOne({"_id" : certUUID});
    let mTree = await generateMerkleTree(certificateDBData);

    //split object into key and value array.
    let disclosedDataParamNames = [];
    let disclosedDataValues = [];

    for(let x in disclosedData) {
        disclosedDataParamNames.push(x);
        disclosedDataValues.push(disclosedData[x]);
    }

    let paramsToShareIndex = disclosedDataParamNames.map( (element) => {return certSchema.ordering.findIndex((orderingElement) => {return orderingElement === element;})});

    let mTreeRoot = mTree.getRoot();
    let disclosedDataHash = disclosedDataValues.map(x => SHA256(x));
    //let verificationSuccess = mTree.verifyMultiProof(mTreeRoot, paramsToShareIndex, disclosedDataHash, mTree.getDepth(), mTreeProof );

    let verificationSuccess = mTree.verifyMultiProof(mTreeRoot, paramsToShareIndex, disclosedDataHash, mTree.getDepth(), mTreeProof);

    console.log("Verification status: " + verificationSuccess);
    return verificationSuccess;
}


module.exports = {generateMerkleRoot, createDigitalSignature, generateCertificateProof, verifyCertificateProof};