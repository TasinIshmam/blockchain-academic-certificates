const universities = require('../database/models/universities');
const certificates = require('../database/models/certificates');
const students = require('../database/models/students');
const chaincode = require('./fabric/chaincode');
const logger = require("./logger");
const encryption = require('./encryption');


/**
 * Create certificate object in database and ledger.
 * For ledger - data needs to be cryptographically signed by student and university private key.
 * @param {certificates.schema} certData
 * @returns {Promise<{}>}
 */
async function issueCertificate(certData) {

    let universityObj = await universities.findOne({"email": certData.universityEmail});
    let studentObj = await students.findOne({"email": certData.studentEmail});

    if (!studentObj) throw new Error("Could not fetch student profile. Provide valid student email.");
    if (!universityObj) throw new Error("Could not fetch university profile.");

    let certDBModel = new certificates(certData);

    let mTreeHash =  await encryption.generateMerkleRoot(certData);
    let universitySignature = await encryption.createDigitalSignature(mTreeHash, certData.universityEmail);
    let studentSignature = await encryption.createDigitalSignature(mTreeHash, certData.studentEmail);

    let chaincodeResult = await chaincode.invokeChaincode("issueCertificate",
        [mTreeHash, universitySignature, studentSignature, certData.dateOfIssuing, certDBModel._id, universityObj.publicKey, studentObj.publicKey ]);

    logger.debug(chaincodeResult);

    let res = await certDBModel.save();

    return true;
    //
    // let result = await chaincode.invokeChaincode("issueCertificate",
    //     [ req.body.name, keys.publicKey, location, req.body.description], false, req.body.email);
}


module.exports = {issueCertificate};