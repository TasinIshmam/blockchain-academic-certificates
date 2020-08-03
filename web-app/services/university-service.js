const moment = require('moment');

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

    let mTreeHash =  await encryption.generateMerkleRoot(certDBModel);
    let universitySignature = await encryption.createDigitalSignature(mTreeHash, certData.universityEmail);
    let studentSignature = await encryption.createDigitalSignature(mTreeHash, certData.studentEmail);

    let chaincodeResult = await chaincode.invokeChaincode("issueCertificate",
        [mTreeHash, universitySignature, studentSignature, certData.dateOfIssuing, certDBModel._id, universityObj.publicKey, studentObj.publicKey ], false, certData.universityEmail);

    logger.debug(chaincodeResult);

    let res = await certDBModel.save();
    if(!res) throw new Error("Could not create certificate in the database");

    return true; //If no errors were thrown, everything completed successfully.
}


/**
 * Merge certificate data from Database and Blockchain Ledger
 * Runtime is O(N^2) which is kind of inefficient.
 * Time complexity shouldn't matter too much because N isn't going to grow very large
 * @param {certificates[]} dbRecordArray
 * @param ledgerRecordArray
 * @returns {certificates[]}
 */
function mergeCertificateData(dbRecordArray, ledgerRecordArray) {
    let certMergedDataArray = [];  //merge data from db and chaincode to create data for ejs view.

    for (let i = 0; i < dbRecordArray.length ; i++) {
        let dbEntry = dbRecordArray[i];
        let chaincodeEntry = ledgerRecordArray.find((element) => {
            return element.certUUID === dbEntry._id.toString();
        });

        certMergedDataArray.push({
            studentName : dbEntry.studentName,
            studentEmail : dbEntry.studentEmail,
            cgpa : dbEntry.cgpa,
            departmentName : dbEntry.departmentName,
            dateOfIssuing: moment(dbEntry.dateOfIssuing).format('YYYY-MM-DD'),
            major: dbEntry.major,
            certUUID: dbEntry._id.toString(),
            hash: chaincodeEntry.certHash

        })
    }

    return certMergedDataArray;
}

/**
 * Fetch and return all certificates issued by a specific university
 * @param {String} universityName
 * @param {String} universtiyEmail
 * @returns {Promise<certificates[]>}
 */
async function getCertificateDataforDashboard(universityName, universtiyEmail) {
    let universityProfile = await chaincode.invokeChaincode("queryUniversityProfileByName",
        [universityName], true, universtiyEmail);
    universityProfile = JSON.parse(universityProfile);

    let certLedgerDataArray = await chaincode.invokeChaincode("getAllCertificateByUniversity",
        [universityProfile.publicKey], true, universtiyEmail);

    certLedgerDataArray = JSON.parse(certLedgerDataArray);
    let certUUIDArray = certLedgerDataArray.map( element => {
        return element.certUUID
    });

    let certDBRecords = await certificates.find().where('_id').in(certUUIDArray).exec();

    return mergeCertificateData(certDBRecords, certLedgerDataArray);
}


module.exports = {issueCertificate,  getCertificateDataforDashboard};