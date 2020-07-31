const express = require('express');
const router = express.Router();

let title = "Blockchain Certificate"


/* GET home page. */
router.get('/', function(req, res, next) { res.render('index', {   title,
        logInType: req.session.user_type || "none"
    });
});




module.exports = router;
