let logger = require("../services/logger");
let encryption = require('../services/encryption');
let certificates = require('../database/models/certificates');
let moment = require('moment');
let title = "Verification Portal";
let root = "verify";
async function postVerify(req,res,next) {
    try {
        let proofObject = req.body.proofObject;
        proofObject = JSON.parse(proofObject);

        if (!proofObject.disclosedData || Object.keys(proofObject.disclosedData).length === 0  ) {
            throw new Error("No parameter given. Provide parameters that need to be verified");
        }
        let proofIsCorrect = await encryption.verifyCertificateProof(proofObject.proof, proofObject.disclosedData, proofObject.certUUID );

        if (proofIsCorrect) {
            let certificateDbObject = await certificates.findOne({"_id": proofObject.certUUID}).select("studentName studentEmail _id dateOfIssuing universityName universityEmail");

            res.render("verify-success", { title, root,
                logInType: req.session.user_type || "none",
                certData : certificateDbObject,
                proofData : proofObject.disclosedData
            })

        } else {
            res.render("verify-fail", {
                title, root,
                logInType: req.session.user_type || "none"
            })
        }

    } catch (e) {
        logger.error(e);
        next(e);
    }
}

module.exports = {postVerify};