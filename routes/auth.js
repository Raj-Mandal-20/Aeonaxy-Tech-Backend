const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');



router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/valid_username', authController.validUsername);
router.post('/check-email', authController.validEmail);

module.exports = router;