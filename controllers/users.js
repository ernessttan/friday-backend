const User = require('../models/user');

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

    const user = new User({ 
        username,
        email, 
        password,
        tasks: [],
        projects: []
    });

    try {
        await user.save();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    res.status(201).json({ message: 'User created' });
}

async function login(req, res) {
    const { email, password } = req.body;

    let existingUser;
    try {
        user = await User.findOne({ email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    if (!existingUser || existingUser.password !== password) {
        res.status(401).json({ message: 'Invalid username or password' });
    }
    // TODO: Validate Password
    
    res.status(200).json({ message: 'Login successful' });
}

module.exports = {
    signup,
    login
}

