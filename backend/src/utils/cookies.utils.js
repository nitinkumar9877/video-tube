const configData = require("../config/environment.config.js");
const isProduction = configData.NODE_ENV === "production";
const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {})
});

// Set Refresh Token
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie(
        "refreshToken",
        refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000)
    );
};

// Set Access Token
const setAccessTokenCookie = (res, accessToken) => {
    res.cookie(
        "accessToken",
        accessToken,
        getCookieOptions(5 * 60 * 1000)
    );
};

// Clear Access Token
const clearAccessTokenCookie = (res) => {
    res.clearCookie(
        "accessToken",
        getCookieOptions()
    );
};

// Clear Refresh Token
const clearRefreshTokenCookie = (res) => {
    res.clearCookie(
        "refreshToken",
        getCookieOptions()
    );
};

module.exports = {
    setRefreshTokenCookie,
    setAccessTokenCookie,
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
};
