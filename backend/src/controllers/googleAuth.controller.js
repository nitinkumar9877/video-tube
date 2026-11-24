const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const configData = require('../config/environment.config');
const { setRefreshTokenCookie, setAccessTokenCookie, clearRefreshTokenCookie, clearAccessTokenCookie } = require('../utils/cookies.utils');
const { generateToken } = require('../config/token.config');

const googleClient = new OAuth2Client(configData.GOOGLE_CLIENT_ID);

const googleAuthSignup = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is missing.'
            });
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: configData.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture, email_verified } = payload;
        if (!email_verified || !email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google credential.'
            });
        }
        let user = await userModel.findOne({ googleId });
        if (!user) {
            user = await userModel.findOne({ email });
            if (user.googleId && user.googleId !== googleId) {
                return res.status(409).json({
                    success: false,
                    message: "This email is linked to another Google account",
                });
            }
            if (user) {
                user.googleId = googleId;
                await user.save();
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists. Please log in using your existing method and link Google from account settings.",
                });
            }
        }
        if (!user) {
            user = new userModel({
                googleId,
                name,
                email,
                profilePictureUrl: picture,
            });
            await user.save();
        }
        // generate JWT tokens
        const { accessToken, refreshToken } = generateToken(user._id);
        const sessionId = new mongoose.Types.ObjectId();

        await TokenModel.create({
            _id: sessionId,
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip
        });

        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);
        return res.status(200).json({
            success: true,
            message: "SuccessFully Login Using Google",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePictureUrl: user.profilePictureUrl
            }
        });
    }
    catch (error) {
        console.error('Error during Google authentication:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during Google authentication.'
        });
    };
};

module.exports = { googleAuthSignup }