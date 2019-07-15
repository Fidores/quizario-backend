const jwt = require('jsonwebtoken');
const config = require('config');

/**
 * Checks if user is logged in, and store user info in req.user.
 */

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('No token provided');

    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
}

module.exports = auth;