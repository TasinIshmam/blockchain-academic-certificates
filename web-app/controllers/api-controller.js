let logger = require("../services/logger");
let encryption = require('../services/encryption');

async function getGenerateProof(req,res,next) {

    let proof = await encryption.generateCertificateProof(req.query.sharedAttributes, req.query.certUUID, req.session.email);


    res.status(200).send( {
        result : "Success"
    } );

}

module.exports = {getGenerateProof};