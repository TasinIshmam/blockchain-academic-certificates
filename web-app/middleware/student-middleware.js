const logger = require('../services/logger');

function authenticateLogin (req, res, next) {
    try {
        if (req.session.user_type === "student") next();
        else throw new Error("Unauthorized access: Login first");
    } catch (e) {
        next(e);
    }
}

function redirectToDashboardIfLoggedIn(req,res,next) {
    try {
        if (req.session.user_type === "student") return res.redirect('/student/dashboard');
        else next();
    } catch (e) {
        next(e);
    }
}

module.exports = {redirectToDashboardIfLoggedIn, authenticateLogin};