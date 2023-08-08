const { validationResult } = require('express-validator');
const uuid = require('uuid').v4;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/httpError')
const User = require('../models/userSchema');


const signup = async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.errors);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    const { email, name, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.find({ email: email });
    } catch (e) {
        return next(new HttpError('Couldnt Signin. Try Again', 500));
    }
    if (existingUser.length !== 0) {
        return next(new HttpError('Email allready exists!!', 422));
    }

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (e) {
        return next(new HttpError('Could not save your credentials. Try again later', 500));
    }

    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword
    });
    try {
        await newUser.save();
    } catch (e) {
        return next(new HttpError('Could not save your credentials. Try again', 500));
    }

    let token;
    try {
        token = jwt.sign({ userId: newUser._id, email: email }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_LIFE_TIME });
    } catch (e) {
        return next(new HttpError('Signing Up failed. try again later', 500));
    }

    newUser.password = undefined;
    res.status(201).json({ user: newUser, token: token });
}

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.find({ email: email });
    } catch (e) {
        return next(new HttpError('Couldnt find your email. Try Again !!', 500));
    }
    if (!existingUser[0] || existingUser.length === 0) {
        return next(new HttpError('Email hasnt been registered!!', 403));
    }
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser[0].password);
    } catch (e) {
        return next(new HttpError('Couldnt log you in. Please try again.', 500));
    }

    if (!isValidPassword) {
        return next(new HttpError('Email or Password is wrong!!!!', 403));
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser[0]._id, email: email }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_LIFE_TIME });
    } catch (e) {
        return next(new HttpError('login failed. try again later', 500));
    }

    existingUser[0].password = undefined;
    res.status(200).json({ user: existingUser[0], message: 'Login', token: token });

}

exports.signup = signup;
exports.login = login;