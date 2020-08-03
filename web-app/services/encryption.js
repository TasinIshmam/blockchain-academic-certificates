const jsrs = require('jsrsasign');
const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');
const chaincode = require('./fabric/chaincode');
const walletUtil = require('./fabric/wallet-utils');

let ecdsa = new jsrs.ECDSA({'curve': 'secp256r1'});


/**
 * Generate root hash of certificate using merkle tree
 * @param {certificates.schema} certData
 * @returns {Promise<string>}
 */
async function generateMerkleRoot(certData) {
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
    const mTreeRoot = new MerkleTree(mTreeLeaves, SHA256).getRoot().toString('hex');

    return mTreeRoot;
}

async function createDigitalSignature(stringToSign, signerEmail) {
    let hexKeyWallet = await walletUtil.loadHexKeysFromWallet(signerEmail);
    let signedData = ecdsa.signHex(stringToSign, hexKeyWallet.privateKey);
    return signedData;
}


module.exports = {generateMerkleRoot, createDigitalSignature};