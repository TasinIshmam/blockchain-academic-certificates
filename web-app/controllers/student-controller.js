let students = require('../database/models/students');
let fabricEnrollment  = require('../services/fabric/enrollment');
let chaincode = require('../services/fabric/chaincode');
let logger = require("../services/logger");


let title = "Student Dashboard";
let root = "student";


async function postRegisterStudent(req, res, next) {
    try {
        let keys = await fabricEnrollment.registerUser(req.body.email);

        let dbResponse = await students.create({
            name : req.body.name,
            email: req.body.email,
            password: req.body.password,
            publicKey: keys.publicKey
        });


        res.render("register-success", { title, root,
            logInType: req.session.user_type || "none"});
    }
    catch (e) {
        logger.error(e);
        next(e);
    }
}

module.exports = {postRegisterStudent};
