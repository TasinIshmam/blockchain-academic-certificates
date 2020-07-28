var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {} );
});


router.get('/register/university', function(req, res, next) {
  res.render('register-university', {} );
});

router.get('/login/university', function (req,res,next) {
  res.render('login-university', {})
});


module.exports = router;
