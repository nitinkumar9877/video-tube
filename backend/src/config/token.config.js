const jwt = require('jsonwebtoken');
const configData = require("./environment.config.js");

const generateToken = (payload) => {
    try {
        const token = jwt.sign(payload, configData.JWT_SECRET, { expiresIn: '1h' });
        console.log("Generated token:", token);
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        return null;
    }
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, configData.JWT_SECRET);
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
};

module.exports = { generateToken, verifyToken };