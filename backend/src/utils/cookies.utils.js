const configData = require("../config/environment.config.js");
const setrefreshTokenCookie = (res, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: configData.NODE_ENV === "production", // Set to true in production
        sameSite: "Strict", // Adjust based on your requirements
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
};

const setAccessTokenCookie = (res, accessToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: configData.NODE_ENV === "production", // Set to true in production
        sameSite: "Strict", // Adjust based on your requirements
        maxAge: 5 * 60 * 1000 // 5 minutes in milliseconds
    };

    res.cookie("accessToken", accessToken, cookieOptions);
};
const clearAccessTokenCookie = (res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: configData.NODE_ENV === "production",
        sameSite: "Strict"
    });
};
const clearrefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: configData.NODE_ENV === "production",
        sameSite: "Strict"
    });
};

module.exports = {
    setrefreshTokenCookie,
    setAccessTokenCookie,
    clearAccessTokenCookie,
    clearrefreshTokenCookie
};