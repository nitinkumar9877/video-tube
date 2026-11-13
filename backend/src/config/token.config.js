const jwt = require('jsonwebtoken');
const configData = require("./environment.config.js");

const generateToken = (payload) => {
    try {
        const accessToken = jwt.sign(payload, configData.JWT_ACCESS_SECRET, { expiresIn: '5m' });
        console.log("Generated token:", accessToken);        
        const refreshToken = jwt.sign(payload, configData.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        console.log("Generated refresh token:", refreshToken);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating token:", error);
        return null;
    }
};

module.exports = { generateToken };