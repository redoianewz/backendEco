const express = require('express');
const router = express.Router(); 


const { getLogin,
    SignUp } = require('../controllers/LoginController');


router.route('/').post(getLogin).post(SignUp);

module.exports = router;

