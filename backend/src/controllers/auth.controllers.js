const userModel = require("../models/user.model");
const imagekit = require("../config/imagekit.config.js");
const { generateToken } = require("../config/token.config.js");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const TokenModel = require("../models/Token.model.js");
const { setAccessTokenCookie, setRefreshTokenCookie } = require("../utils/cookies.utils.js");
const mongoose = require("mongoose");
const { sha256hashConverter } = require("../utils/hash.utils.js");
const { clearAccessTokenCookie, clearRefreshTokenCookie } = require("../utils/cookies.utils.js");


// const signUp = async (req, res) => {
//     let newUser;

//     try {
//         const username = req.body.username?.trim();
//         const email = req.body.email?.trim().toLowerCase();
//         const { password } = req.body;

//         if (!username || !email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         if (!validator.isEmail(email)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid email format"
//             });
//         }

//         if (!validator.isStrongPassword(password, {
//             minLength: 8,
//             minLowercase: 1,
//             minUppercase: 1,
//             minNumbers: 1,
//             minSymbols: 1
//         })) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password must contain uppercase, lowercase, number and symbol"
//             });
//         }

//         const existingUser = await userModel.findOne({
//             $or: [{ email }, { username }]
//         });

//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: existingUser.email === email
//                     ? "Email already exists"
//                     : "Username already exists",
//                 keyPattern: {
//                     [existingUser.email === email ? "email" : "username"]: 1
//                 }
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         newUser = await userModel.create({
//             username,
//             email,
//             password: hashedPassword
//         });

//         const tokens = generateToken({ userId: newUser._id });
//         if (!tokens?.accessToken || !tokens.refreshToken) {
//             await userModel.deleteOne({ _id: newUser._id });
//             newUser = null;
//             throw new Error("Token generation failed");
//         }

//         const { accessToken, refreshToken } = tokens;
//         const sessionId = new mongoose.Types.ObjectId();

//         await TokenModel.create({
//             _id: sessionId,
//             userId: newUser._id,
//             refreshToken,
//             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//             userAgent: req.get("user-agent") || null,
//             ipAddress: req.ip
//         });

//         setAccessTokenCookie(res, accessToken);
//         setRefreshTokenCookie(res, refreshToken);

//         return res.status(201).json({
//             success: true,
//             message: "User created successfully",
//             user: {
//                 _id: newUser._id,
//                 username: newUser.username,
//                 email: newUser.email,
//                 profilePictureUrl: newUser.profilePictureUrl
//             }
//         });
//     } catch (error) {
//         if (error?.code === 11000) {
//             const duplicateField = Object.keys(error.keyPattern || {})[0];
//             return res.status(409).json({
//                 success: false,
//                 message: duplicateField
//                     ? `${duplicateField === "email" ? "Email" : "Username"} already exists`
//                     : "Username or email already exists",
//                 code: 11000,
//                 keyPattern: error.keyPattern || {}
//             });
//         }

//         if (newUser?._id) {
//             await userModel.deleteOne({ _id: newUser._id }).catch(() => { });
//         }

//         console.error("Signup Error:", error.message);
//         return res.status(500).json({
//             success: false,
//             message: "Signup failed"
//         });
//     }
// };


const signUp = async (req, res) => {
    let newUser;

    try {
        const username = req.body.username?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

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

        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === email
                    ? "Email already exists"
                    : "Username already exists",
                keyPattern: {
                    [existingUser.email === email ? "email" : "username"]: 1
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        newUser = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const tokens = generateToken({ userId: newUser._id });

        if (!tokens?.accessToken || !tokens.refreshToken) {
            await userModel.deleteOne({ _id: newUser._id });
            newUser = null;
            throw new Error("Token generation failed");
        }

        const { accessToken, refreshToken } = tokens;
        const sessionId = new mongoose.Types.ObjectId();

        await TokenModel.create({
            _id: sessionId,
            userId: newUser._id,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip
        });

        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePictureUrl: newUser.profilePictureUrl
            }
        });

    } catch (error) {

        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: duplicateField
                    ? `${duplicateField === "email" ? "Email" : "Username"} already exists`
                    : "Username or email already exists",
                code: 11000,
                keyPattern: error.keyPattern || {}
            });
        }

        if (newUser?._id) {
            await userModel.deleteOne({ _id: newUser._id }).catch(() => { });
        }

        console.error("Signup Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Signup failed"
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
        const tokens = generateToken({ userId: user._id });
        if (!tokens?.accessToken || !tokens.refreshToken) {
            throw new Error("Token generation failed");
        }
        const { accessToken, refreshToken } = tokens;
        console.log("8");
        console.log("9");

        // Create session in MongoDB
        await TokenModel.create({
            _id: sessionId,
            userId: user._id,
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip
        });
        console.log("10");

        // Store access token in HttpOnly cookie
        setAccessTokenCookie(res, accessToken);

        console.log("11");
        // Store refresh token in HttpOnly cookie
        setRefreshTokenCookie(res, refreshToken);
        console.log("12");

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePictureUrl: user.profilePictureUrl
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
        clearAccessTokenCookie(res);
        clearRefreshTokenCookie(res);
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const refreshToken = async (req, res) => {
    try {
        console.log("----------------------Refresh Token controller start here----------------------");
        const user = req.user; // Assuming user is attached to req in middleware
        console.log("User from middleware:", user);
        const userPreviousToken = await TokenModel.find({ userId: user._id });
        console.log("Previous token for user:", userPreviousToken);
        if (userPreviousToken) {
            // Delete every previous token for the user whose ip is same from the current request and user agent is same from the current request
            await TokenModel.deleteMany({
                userId: user._id,
                ipAddress: req.ip,
                userAgent: req.get("user-agent") || null
            });
        }
        const tokens = generateToken({ userId: user._id });
        if (!tokens?.accessToken || !tokens.refreshToken) {
            throw new Error("Token generation failed");
        }
        const { accessToken, refreshToken } = tokens;
        console.log("New tokens generated successfully");
        console.log("1");
        setRefreshTokenCookie(res, refreshToken);
        console.log("2");
        setAccessTokenCookie(res, accessToken);
        console.log("3");
        // Generate a unique session ID
        const sessionId = new mongoose.Types.ObjectId();
        await TokenModel.create({
            _id: sessionId,
            userId: user._id,
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip
        });
        console.log("------------------------successfully refreshed the access token and refresh token------------------------");
        res.status(200).json({
            success: true,
            message: "Access token refreshed",
            accessToken: accessToken
        });
    }
    catch (error) {
        console.log("----------------------Refresh Token controller catch block start here----------------------");
        console.error("Error during token refresh:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const myProfile = async (req, res) => {
    try {
        const user = req.user; // Assuming user is attached to req in middleware
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePictureUrl: user.profilePictureUrl,
                    subscribedChannels: user.subscribedChannels || [],
                }
            }

        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePictureUrl: user.profilePictureUrl,
                    subscribedChannels: user.subscribedChannels || [],
                }
            }
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { signUp, login, logout, refreshToken, myProfile, getUserProfile };