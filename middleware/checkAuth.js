const jwt = require('jsonwebtoken');
// Auth check middleware
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        // If token does not exists, throw error
        if (!token) {
            const error = new Error('You are not logged in', 401);
            return next(error);
        }
        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        const error = new Error('You are not logged in', 401);
        return next(error);
    }
}

