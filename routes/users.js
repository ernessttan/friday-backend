const express = require('express');
const userControllers = require('../controllers/users');

const router = express.Router();

router.post('/', userControllers.signup);

router.post('/login', userControllers.login);

module.exports = router;