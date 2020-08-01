const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student-controller');
let title = "Student Dashboard";
let root = "student";


router.get('/register', function(req, res, next) {
    res.render('register-student', {   title, root,
        logInType: req.session.user_type || "none"
    });
});

//
// router.get('/login',universityMiddleware.redirectToDashboardIfLoggedIn, function (req,res,next) {
//     res.render('login-university',  {   title, root,
//         logInType: req.session.user_type || "none"
//     })
// });
//
// router.get('/dashboard', universityMiddleware.authenticateLogin, function (req,res,next) {
//     res.send(JSON.stringify(req.session));
// });
//
//

router.post('/register/submit', studentController.postRegisterStudent);

// router.post('/login/submit', universityController.postLoginUniversity);
//
// router.get('/logout', universityController.logOutAndRedirect);

module.exports = router;
