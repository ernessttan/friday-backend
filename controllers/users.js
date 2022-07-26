const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signup(req, res) {
    const { username, email, password } = req.body;

    // Validate if the username or email is already in use
    let existingUser;
    try {
        existingUser = await User.findOne({ $or: [{ username }, { email }] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if (existingUser) {
        res.status(409).json({ message: 'Username or email is already in use' });
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
  
    const user = new User({ 
        email, 
        password: hashedPassword,
        tasks: [],
        projects: []
    });

    try {
        await user.save();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    let token;
    try {
        token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.status(201).json({ userId: user._id, token });
}

async function login(req, res) {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if (!existingUser) {
        res.status(401).json({ message: 'That user does not exist' });
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if (!isValidPassword) {
        res.status(401).json({ message: 'Incorrect password' });
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.status(200).json({ userId: existingUser._id, token });
}

module.exports = {
    signup,
    login
}

