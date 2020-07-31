const express = require('express');
const router = express.Router();
const universityController = require('../controllers/university-controller');
const universityMiddleware = require('../middleware/university-middleware');

let title = "University Dashboard";


router.get('/register', function(req, res, next) {
    res.render('register-university', {   title,
        logInType: req.session.user_type || "none"
    });
});

router.get('/login',universityMiddleware.redirectToDashboardIfLoggedIn, function (req,res,next) {
    res.render('login-university',  {   title,
        logInType: req.session.user_type || "none"
    })
});

router.get('/dashboard', universityMiddleware.authenticateLogin, function (req,res,next) {
    res.send(JSON.stringify(req.session));
});

router.post('/register/submit', universityController.postRegisterUniversity);

router.post('/login/submit', universityController.postLoginUniversity);

router.get('/logout', universityController.logOutAndRedirect);

module.exports = router;
