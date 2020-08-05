const express = require('express');
const router = express.Router();

let title = "Verification Portal";
let root = "verify";


router.get('/', function(req, res, next) { res.render('verify', {   title, root,
    logInType: req.session.user_type || "none"
});});


module.exports = router;
