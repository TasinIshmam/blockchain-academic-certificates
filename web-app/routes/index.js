const express = require('express');
const router = express.Router();
const universityController = require('../controllers/university-controller');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {} );
});


router.get('/university/register', function(req, res, next) {
  res.render('register-university', {} );
});

router.get('/university/login', function (req,res,next) {
  res.render('login-university', {})
});

router.post('/university/register/submit', universityController.registerUniversity);

module.exports = router;
