const userModel = require("../models/user.model");
const imagekit = require("../config/imagekit.config.js");
const { generateAccessToken, generaterefreshToken } = require("../config/token.config.js");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const TokenModel = require("../models/Token.model.js");
const { setAccessTokenCookie, setrefreshTokenCookie } = require("../utils/cookies.utils.js");
const { generateToken } = require("../config/token.config.js")
const mongoose = require("mongoose");
const { sha256hashConverter } = require("../utils/hash.utils.js");


const signUp = async (req, res) => {
    try {
        console.log("1");
        const username = req.body.username?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;
        console.log("2");

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        console.log("3");

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }
        console.log("4");

        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            return res.status(400).json({
                success: false,
                message: "Password must contain uppercase, lowercase, number and symbol"
            });
        }
        console.log("5");

        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        });
        console.log("6");

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists"
            });
        }
        console.log("7");

        // if (!req.file) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Profile picture is required"
        //     });
        // }

        // const uploadedImage = await imagekit.upload({
        //     file: req.file.buffer,
        //     fileName: req.file.originalname,
        //     folder: "/profile-pictures",
        //     useUniqueFileName: true
        // });
        // if (!uploadedImage.url) {
        //     throw new Error("ImageKit did not return an image URL");
        // }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("8");

        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
            // profilePictureUrl: uploadedImage.url
        });

        console.log("9");

        const { accessToken, refreshToken } = generateToken({
            id: newUser._id
        });
        console.log("9-b");
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        console.log("9-c");
        if (!accessToken || !refreshToken) {
            throw new Error("Token generation failed");
        }

        console.log("10");

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax",
            maxAge: 5 * 60 * 1000
        });
        console.log("11");

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePictureUrl: newUser.profilePictureUrl
            }
        });
    } catch (error) {
        console.log("------------------ signup error catch block ------------------");
        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Signup failed",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const login = async (req, res) => {
    try {
        console.log("1");
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        console.log("2");

        const user = await userModel.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");
        console.log("3");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        console.log("4");
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );
        console.log("5");

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        console.log("6");

        // Generate a unique session ID
        const sessionId = new mongoose.Types.ObjectId();
        console.log("7");

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateToken({
            userId: user._id
        });
        console.log("8");

        // Hash refresh token
        const refreshTokenHash = sha256hashConverter(refreshToken);
        const accessTokenHash = sha256hashConverter(accessToken);
        console.log("9");

        // Create session in MongoDB
        await TokenModel.create({
            _id: sessionId,
            userId: user._id,
            refreshTokenHash: refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip
        });
        console.log("10");

        // Store access token in HttpOnly cookie
        setAccessTokenCookie(res, accessTokenHash);

        console.log("11");
        // Store refresh token in HttpOnly cookie
        setrefreshTokenCookie(res, refreshTokenHash);
        console.log("12");

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessTokenHash: accessTokenHash,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.log("------------------ login error catch block ------------------");
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const logout = (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const refreshToken = async (req, res) => {
    try {
        const user = req.user; // Assuming user is attached to req in middleware
        const newAccessToken = generateAccessToken({ id: user._id });
        const newRefreshToken = generaterefreshToken({ id: user._id });
        setrefreshTokenCookie(res, newRefreshToken);
        setAccessTokenCookie(res, newAccessToken);
        res.status(200).json({
            status: true,
            message: "Access token refreshed",
            accessToken: newAccessToken
        });
    }
    catch (error) {
        console.error("Error during token refresh:", error);
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
}

module.exports = { signUp, login, logout, refreshToken };
