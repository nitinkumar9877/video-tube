const configData = require("../config/environment.config");
const { clearAccessTokenCookie, clearrefreshTokenCookie } = require("../utils/cookies.utils");

const accessTokenValidation = async (req, res, next) => {
    const accessToken = req.cookies?.ACCESS_TOKEN_SECRET;
    if (!accessToken) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized: No access token provided"
        });
    }
    try {
        const decoded = jwt.verify(accessToken, configData.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Attach the decoded user information to the request object
        const userId = decoded.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            clearAccessTokenCookie(res);
            clearrefreshTokenCookie(res);
            return res.status(401).json({
                status: false,
                message: "Unauthorized: User not found"
            });
        }
        req.user = user; // Attach the user object to the request for further use
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        clearAccessTokenCookie(res);
        clearrefreshTokenCookie(res);
        if (
            error.name === 'TokenExpiredError' ||
            error.name === 'JsonWebTokenError' ||
            error.name === 'NotBeforeError'
        ) {
            return res.status(401).json({
                success: false,
                message: 'Access token expired or invalid'
            });
        }

        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

const refreshTokenValidation = async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
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
        console.log("4th catch 1st");

        return res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

    }
    let user;
    try {
        user = await userModel.findById(decodedrefreshToken.id);
        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(401).json({
            message: "Refresh token is invalid or expired."
        });
    }
    req.user = user; // Attach the user object to the request for further use
    next(); // Proceed to the next middleware or route handler
};

module.exports = {
    accessTokenValidation,
    refreshTokenValidation
};