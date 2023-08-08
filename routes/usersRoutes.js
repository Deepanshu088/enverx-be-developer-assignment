const express = require('express');
const { check } = require('express-validator');
const { signup, login} = require('../controllers/usersControllers');
const HttpError = require('../models/httpError');
const { signUpValidator, loginInValidator } = require('../validators/userValidators');

const router = express.Router();

router.post('/signup', signUpValidator, signup);

router.post('/login', loginInValidator, login);


module.exports = router;