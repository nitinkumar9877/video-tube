const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const configData = require('../config/environment.config');
const { setRefreshTokenCookie, setAccessTokenCookie } = require('../utils/cookies.utils');
const { generateToken } = require('../config/token.config');
const TokenModel = require('../models/Token.model.js');

const googleClient = new OAuth2Client(configData.GOOGLE_CLIENT_ID);

const googleAuthSignup = async (req, res) => {
    try {
        console.log("-----------------------------Google Auth Signup-----------------------------");
        console.log("1")
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is missing.'
            });
        }
        console.log("Credential received:", credential);
        console.log("11");
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: configData.GOOGLE_CLIENT_ID,
        });
        console.log("2")
        const payload = ticket.getPayload();
        console.log("3")
        const { sub: googleId, email, name, picture, email_verified } = payload;
        console.log("4")
        if (!email_verified || !email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google credential.'
            });
        }
        console.log("5")
        let user = await userModel.findOne({ email });
        if (!user) {
            // user = await userModel.findOne({ googleId });
            console.log("5.1")
            // if (user.googleId && user.googleId !== googleId) {
            //     console.log("5.1.1")
            //     return res.status(409).json({
            //         success: false,
            //         message: "This email is linked to another Google account",
            //     });
            // }
            console.log("5.2")
            if (user) {
                console.log("5.2.1");
                user.googleId = googleId;
                await user.save();
                console.log("5.2.2");
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists. Please log in using your existing method and link Google from account settings.",
                });
            }
        }
        console.log("6")
        if (!user) {
            user = new userModel({
                googleId,
                username: email.split('@')[0],
                email,
                profilePictureUrl: picture,
            });
            console.log("6.1")
            await user.save();
            console.log("6.2")
        }
        console.log("7")

        // generate JWT tokens
        const tokens = generateToken({ userId: user._id });

        if (!tokens?.accessToken || !tokens.refreshToken) {
            await userModel.deleteOne({ _id: user._id });
            user = null;
            throw new Error("Token generation failed");
        }

        const { accessToken, refreshToken } = tokens;
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
        console.log("10")
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