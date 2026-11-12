const userModel = require("../models/user.model");
const imagekit = require("../config/imagekit.config.js");
const { generateToken } = require("../config/token.config.js");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const signUp = async (req, res) => {
    try {
        const username = req.body.username?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
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
                message: "Password must contain uppercase, lowercase, number and symbol"
            });
        }

        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Profile picture is required"
            });
        }

        const uploadedImage = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: "/profile-pictures",
            useUniqueFileName: true
        });
        if (!uploadedImage.url) {
            throw new Error("ImageKit did not return an image URL");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
            profilePictureUrl: uploadedImage.url
        });

        const token = generateToken({
            id: newUser._id
        });

        if (!token) {
            throw new Error("Token generation failed");
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

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
    // Implementation for login
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        let token = generateToken({ id: user._id });
        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict", maxAge: 7 * 24 * 60 * 60 * 1000 }); // 1 week
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { signUp, login, logout };
