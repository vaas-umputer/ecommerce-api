// authJwt.js
const jwt = require('jsonwebtoken');

function authJwt() {
    return (req, res, next) => {
        const token = req.header('Authorization');
        const secret = process.env.SECRET;

        if (!token) {
            return res.status(401).send('Access Denied: No Token Provided!');
        }

        try {
            const verified = jwt.verify(token.split(' ')[1], secret);
            req.user = verified;  // You can access this later in your routes
            next();  // Proceed to the next middleware or route handler
        } catch (err) {
            res.status(400).send('Invalid Token');
        }
    };
}

module.exports = authJwt;
