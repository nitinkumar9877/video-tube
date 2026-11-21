const configData = require("../config/environment.config.js");

const isProduction = configData.NODE_ENV === "production";

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    ...(maxAge ? { maxAge } : {})
});

const setrefreshTokenCookie = (res, refreshToken) => {
    res.cookie(
        "refreshToken",
        refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000)
    );
};

const setaccessTokenCookie = (res, accessToken) => {
    res.cookie("accessToken", accessToken, getCookieOptions(5 * 60 * 1000));
};

const clearaccessTokenCookie = (res) => {
    res.clearCookie("accessToken", getCookieOptions());
};

const clearrefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", getCookieOptions());
};

module.exports = {
    setrefreshTokenCookie,
    setaccessTokenCookie,
    clearaccessTokenCookie,
    clearrefreshTokenCookie
};