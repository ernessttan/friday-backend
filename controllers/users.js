const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signup(req, res, next) {
    const { firstName, email, password } = req.body;

    // Validate if the email is already in use
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new Error(`Signing up failed, please try again`, 500);
        return next(error);
    }

    // If email exists, return error
    if (existingUser) {
        const error = new Error(`User with email ${email} already exists`, 400);
        return next(error);
    }

    // Hash password
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
       const error = new Error(`Could not create user, please try again.`, 500);
       return next(error);
    }
  
    const user = new User({ 
        firstName,
        email, 
        password: hashedPassword,
        tasks: [],
        projects: []
    });

    try {
        await user.save();
    } catch (err) {
        const error = new Error(`Could not create user, please try again.`, 500);
        console.log(err.message);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
        const error = new Error(`Could not create user, please try again.`, 500);
        console.log(err.message);
        return next(error);
    }
    // Send response with userId and token
    res.status(201).json({ userId: user._id, token });
}

async function login(req, res, next) {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        const error = new Error(`Login failed, please try again`, 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new Error(`User with email ${email} does not exist`, 400);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new Error(`Login failed, please check your credentials`, 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new Error(`Login failed, please check your password`, 400);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
        const error = new Error(`Login failed, please try again.`, 500);
        return next(error);
    }
    res.status(200).json({ userId: existingUser._id, token });
}

module.exports = {
    signup,
    login
}

