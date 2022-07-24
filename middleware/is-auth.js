const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // const authHeader = req.get('Authorization');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Not authenticated.', success: false});
    }
    const token = authHeader.split(' ')[1]; // "bearer token" 
    // const token = authHeader;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
        return res.status(500).json({ message: 'Invalid token.', success: false});
    }
    if (!decodedToken) {
        return res.status(401).json({ message: 'Not authenticated.', success: false});
    }
    req.userId = decodedToken.userId;
    next();
}