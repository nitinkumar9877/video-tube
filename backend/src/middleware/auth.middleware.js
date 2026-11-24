const configData = require("../config/environment.config");
const { clearAccessTokenCookie, clearRefreshTokenCookie } = require("../utils/cookies.utils");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model.js");
const TokenModel = require("../models/Token.model.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const accessTokenValidation = async (req, res, next) => {
    try {
        // 1. Get access token from cookies
        console.log("----------------------Access Token Middleware start here----------------------");
        const accessToken = req.cookies?.accessToken;
        console.log("1");
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Access token is missing."
            });
        }
        console.log("2");

        // 2. Verify JWT signature and expiration
        let decoded;

        try {
            decoded = jwt.verify(
                accessToken,
                configData.JWT_ACCESS_SECRET
            );
        } catch (error) {
            printCatchBlockError(error);
            clearAccessTokenCookie(res);

            if (
                error.name === "TokenExpiredError" ||
                error.name === "JsonWebTokenError" ||
                error.name === "NotBeforeError"
            ) {
                return res.status(401).json({
                    success: false,
                    message: "Access token is invalid or expired."
                });
            }

            throw error;
        }
        console.log("3");

        // 3. Extract user ID
        const userId = decoded.userId;

        if (!userId) {
            clearAccessTokenCookie(res);

            return res.status(401).json({
                success: false,
                message: "Invalid access token payload."
            });
        }
        console.log("4");

        // 4. Find user in MongoDB
        const user = await userModel.findById(userId);

        if (!user) {
            clearAccessTokenCookie(res);
            clearRefreshTokenCookie(res);

            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }
        console.log("User found:", user);
        console.log("5");

        // 5. Attach user to request
        req.user = user;
        console.log("6");
        console.log("----------------------Access Token Middleware end here----------------------");

        // 6. Continue to controller
        return next();

    } catch (error) {
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const refreshTokenValidation = async (req, res, next) => {
    console.log("---------------------- refreshToeknValidation Middleware start here----------------------");
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token is missing."
        });
    }
    console.log("1st");
    let decodedrefreshToken;
    try {
        decodedrefreshToken = jwt.verify(
            refreshToken,
            configData.JWT_REFRESH_SECRET
        );

    } catch (error) {
        console.log("inside catch 1st");

        clearAccessTokenCookie(res);
        clearRefreshTokenCookie(res);
        printCatchBlockError(error);

        return res.status(401).json({
            success: false,
            message: "Refresh token is invalid or expired."
        });
    }
    console.log("2nd");
    let user;
    try {
        console.log("decodedrefreshToken.id:", decodedrefreshToken.userId);
        if (!decodedrefreshToken.userId) {
            clearAccessTokenCookie(res);
            clearRefreshTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token payload."
            });
        }

        user = await userModel.findById(decodedrefreshToken.userId);
        if (!user) {
            clearAccessTokenCookie(res);
            clearRefreshTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        const tokenSession = await TokenModel.findOne({
            userId: user._id,
            refreshToken,
            expiresAt: { $gt: new Date() }
        });

        if (!tokenSession) {
            clearAccessTokenCookie(res);
            clearRefreshTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Refresh token session is no longer valid."
            });
        }
    } catch (error) {
        printCatchBlockError(error);
        clearRefreshTokenCookie(res);
        return res.status(401).json({
            success: false,
            message: "Refresh token is invalid or expired."
        });
    }
    console.log("3rd");
    req.user = user; // Attach the user object to the request for further use
    console.log("4th");
    console.log("----------------------Auth Middleware end here----------------------");
    next(); // Proceed to the next middleware or route handler
};

module.exports = {
    accessTokenValidation,
    refreshTokenValidation
};