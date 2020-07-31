let universities = require('../database/models/universities');
let fabricEnrollment  = require('../services/fabric/enrollment');
let chaincode = require('../services/fabric/chaincode');
let logger = require("../services/logger");

//
async function postRegisterUniversity(req, res, next) {
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
        logger.error(e);
        next(e);
    }
}


async function postLoginUniversity (req,res,next) {
    try {
        let universityObject = await universities.validateByCredentials(req.body.email, req.body.password)
        req.session.user_id = universityObject._id;
        req.session.user_type = "university";
        req.session.email = universityObject.email;
        req.session.name = universityObject.name;

        return res.redirect("/university/dashboard")
    } catch (e) {
        logger.error(e);
        next(e);
    }
}

async function logOutAndRedirect (req, res, next) {
    req.session.destroy(function () {
        res.redirect('/');
    });
};
module.exports = {postRegisterUniversity, postLoginUniversity, logOutAndRedirect};