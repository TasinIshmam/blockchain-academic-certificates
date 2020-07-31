const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');


router.post('/register/university', authController.registerUniversity);

module.exports = router;
