let students = require('../database/models/students');
let fabricEnrollment  = require('../services/fabric/enrollment');
let chaincode = require('../services/fabric/chaincode');
let logger = require("../services/logger");
let studentService = require('../services/student-service');

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

async function logOutAndRedirect (req, res, next) {
    req.session.destroy(function () {
        res.redirect('/');
    });
};


async function postLoginStudent (req,res,next) {
    try {
        let studentObject = await students.validateByCredentials(req.body.email, req.body.password)

        req.session.user_id = studentObject._id;
        req.session.user_type = "student";
        req.session.email = studentObject.email;
        req.session.name = studentObject.name;
        req.session.publicKey = studentObject.publicKey;

        return res.redirect("/student/dashboard")
    } catch (e) {
        logger.error(e);
        next(e);
    }
}


async function getDashboard(req, res, next) {
    try {
        let certData = await studentService.getCertificateDataforDashboard(req.session.publicKey, req.session.email);
        res.render("dashboard-student", { title, root, certData,
            logInType: req.session.user_type || "none"});

    } catch (e) {
        logger.error(e);
        next(e);
    }
}

module.exports = {postRegisterStudent, postLoginStudent, logOutAndRedirect, getDashboard};
