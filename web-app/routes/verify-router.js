const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verify-controller');

let title = "Verification Portal";
let root = "verify";


router.get('/', function(req, res, next) { res.render('verify', {   title, root,
    logInType: req.session.user_type || "none"
});});

router.post('/', verifyController.postVerify);

module.exports = router;
