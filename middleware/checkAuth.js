module.exports = (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    // Validate token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Add data to request object
    req.userData = { userId: decodedToken.userId };
    next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}