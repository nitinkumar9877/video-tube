const configData = require("../config/environment.config");
const { clearAccessTokenCookie, clearRefreshTokenCookie } = require("../utils/cookies.utils");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user.model.js");
const TokenModel = require("../models/Token.model.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const accessTokenValidation = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Access token is missing."
            });
        }

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
        const userId = decoded.userId;

        if (!userId) {
            clearAccessTokenCookie(res);

            return res.status(401).json({
                success: false,
                message: "Invalid access token payload."
            });
        }
        const user = await userModel.findById(userId)
            .select("_id username email profilePictureUrl subscribedChannels channels");

        if (!user) {
            clearAccessTokenCookie(res);
            clearRefreshTokenCookie(res);

            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }
        req.user = user;
        return next();

    } catch (error) {
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const optionalAccessTokenValidation = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        return next();
    }

    let decoded;
    try {
        decoded = jwt.verify(accessToken, configData.JWT_ACCESS_SECRET);
    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            clearAccessTokenCookie(res);
            return next();
        }

        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }

    if (!mongoose.isValidObjectId(decoded.userId)) {
        clearAccessTokenCookie(res);
        return next();
    }

    try {
        const user = await userModel.findById(decoded.userId)
            .select("_id username email profilePictureUrl subscribedChannels channels");
        if (!user) {
            clearAccessTokenCookie(res);
            clearRefreshTokenCookie(res);
            return next();
        }

        req.user = user;
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
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token is missing."
        });
    }

    let decodedrefreshToken;
    try {
        decodedrefreshToken = jwt.verify(
            refreshToken,
            configData.JWT_REFRESH_SECRET
        );
    } catch (error) {
        clearAccessTokenCookie(res);
        clearRefreshTokenCookie(res);
        printCatchBlockError(error);

        return res.status(401).json({
            success: false,
            message: "Refresh token is invalid or expired."
        });
    }

    if (!mongoose.isValidObjectId(decodedrefreshToken.userId)) {
        clearAccessTokenCookie(res);
        clearRefreshTokenCookie(res);
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token payload."
        });
    }

    let user;
    let tokenSession;
    try {
        user = await userModel.findById(decodedrefreshToken.userId);
        if (user) {
            tokenSession = await TokenModel.findOne({
                userId: user._id,
                refreshToken,
                expiresAt: { $gt: new Date() }
            });
        }
    } catch (error) {
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Unable to validate refresh session."
        });
    }

    if (!user) {
        clearAccessTokenCookie(res);
        clearRefreshTokenCookie(res);
        return res.status(401).json({
            success: false,
            message: "User not found."
        });
    }

    if (!tokenSession) {
        return res.status(401).json({
            success: false,
            message: "Refresh token session is no longer valid."
        });
    }

    req.user = user;
    return next();
};

module.exports = {
    accessTokenValidation,
    optionalAccessTokenValidation,
    refreshTokenValidation
};