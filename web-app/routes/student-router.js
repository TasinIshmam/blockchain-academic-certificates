const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student-controller');
const studentMiddleware = require('../middleware/student-middleware');
let title = "Student Dashboard";
let root = "student";

router.get('/dashboard', studentMiddleware.authenticateLogin, studentController.getDashboard);

router.get('/register', function(req, res, next) {
    res.render('register-student', {   title, root,
        logInType: req.session.user_type || "none"
    });
});

router.get('/login',studentMiddleware.redirectToDashboardIfLoggedIn, function (req,res,next) {
    res.render('login-student',  {   title, root,
        logInType: req.session.user_type || "none"
    })
});

router.get('/logout', studentController.logOutAndRedirect);

router.post('/register/submit', studentController.postRegisterStudent);

router.post('/login/submit', studentController.postLoginStudent);


module.exports = router;
