const express = require('express');
const isAuth = require('../middleware/is_auth');
const personalDetailsController = require('../controllers/personalDetails');

const router= express.Router();


router.post('/personal-details',  personalDetailsController.postPersonalDetails);


module.exports = router;
