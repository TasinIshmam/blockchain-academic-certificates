let universities = require('../database/models/universities');
let fabricEnrollment  = require('../services/fabric/enrollment');
let chaincode = require('../services/fabric/chaincode');
let logger = require("../services/logger");

//
async function registerUniversity(req, res, next) {
    try {
        let keys = await fabricEnrollment.registerUser(req.body.email);
        let location = req.body.location + `, ${req.body.country}`;

        let dbResponse = await universities.create({
            name : req.body.name,
            email: req.body.email,
            description: req.body.description,
            location: location,
            password: req.body.password,
            publicKey: keys.publicKey
        });

        let result = await chaincode.invokeChaincode("registerUniversity",
            [ req.body.name, keys.publicKey, location, req.body.description], false, req.body.email);


        res.render("register-success", {});
    }
    catch (e) {
        next(e);
    }
}


module.exports = {registerUniversity};