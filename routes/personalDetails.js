const express = require('express');
const isAuth = require('../middleware/is_auth');
const personalDetailsController = require('../controllers/personalDetails');

const router= express.Router();


router.post('/personal-details', isAuth, personalDetailsController.postPersonalDetails);
router.get('/personal-details/datataken', isAuth, personalDetailsController.isPersonalDetalilsTaken);

module.exports = router;
