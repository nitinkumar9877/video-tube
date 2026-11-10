const userModel = require("../models/user.model");
const uploadOnCloudinary = require("../config/cloudinary.config.js");
const { generateToken } = require("../config/token.config.js");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const signUp = async (req, res) => {
    // Implementation for sign up
    try {
        console.log("1st");
        const { username, email, password } = req.body;
        console.log("2nd");
        let photoUrl;
        if (req.file) {
            photoUrl = await uploadOnCloudinary(req.file.path);
        }
        console.log("3rd");

        const exisitingUser = await userModel.findOne({ email });
        if (exisitingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        console.log("4th");

        // Validate email and password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        console.log("5th");

        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol" });
        }
        console.log("6th");

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("7th");

        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            photoUrl
        });
        console.log("8th");

        await newUser.save();
        console.log("9th");

        let token = generateToken({ id: newUser._id });
        console.log("10th");

        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict", maxAge: 7 * 24 * 60 * 60 * 1000 }); // 1 week

        console.log("11th");
        res.status(201).json({ message: "User created successfully", token });

    } catch (error) {
        console.error("Catch block error");
        console.error("Error during sign up:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

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