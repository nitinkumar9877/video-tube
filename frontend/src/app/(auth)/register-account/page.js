
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import styles from "../../../components/styleSheets/register.module.css";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../../assets/playTube.webp";
import { AuthRegisterUser } from "@/services/AuthUser";

const RegisterNewUser = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [backendImage, setbackendImage] = useState(null);
    const [frontendImage, setfrontendImage] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    // Step 1 validation
    const validateStepOne = () => {
        const newErrors = {};

        const username = formData.username.trim();
        const email = formData.email.trim();

        if (!username) {
            newErrors.username = "Username is required";
        } else if (username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (username.length > 20) {
            newErrors.username = "Username cannot exceed 20 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username =
                "Only letters, numbers and underscores are allowed";
        }

        if (!email) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Step 2 validation
    const validateStepTwo = () => {
        const newErrors = {};

        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            newErrors.password =
                "Include uppercase, lowercase and a number";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Continue to next step
    const handleContinue = () => {
        if (step === 1 && validateStepOne()) {
            setStep(2);
        } else if (step === 2 && validateStepTwo()) {
            setStep(3);
        }
    };

    // Final registration
    const handleCreateAccount = async () => {
        if (!backendImage) {
            setErrors({
                profilePicture: "Please upload a profile picture",
            });
            return;
        }

        // Prepare data for backend API
        const data = new FormData();

        data.append("username", formData.username.trim());
        data.append("email", formData.email.trim());
        data.append("password", formData.password);
        data.append("profilePicture", backendImage);

        console.log("Registration data prepared");

        // Connect your registration API here.
        const registeredUserApi = await AuthRegisterUser(data);
        console.log("User registered successfully:", registeredUserApi);
        alert("All fields are valid! Ready to create account.");
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        setbackendImage(file);
        setfrontendImage(URL.createObjectURL(file));
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#0f0f0f] px-4 py-10 overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-[-150px] left-[-100px] w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px]"></div>

            <div className="absolute bottom-[-150px] right-[-100px] w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[120px]"></div>

            {/* Registration Card */}
            <div className="relative z-10 w-full max-w-[480px] bg-[#181818]/95 border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">

                {/* Header */}
                <div className="flex items-center mb-9">

                    <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => {
                            setErrors({});
                            setStep((prev) => Math.max(1, prev - 1));
                        }}
                        disabled={step === 1}
                    >
                        <FaArrowLeft size={18} />
                    </button>

                    <span className="text-white text-xl sm:text-2xl font-semibold tracking-tight ml-2">
                        Create Account
                    </span>
                </div>

                {/* Step Indicator */}
                <div className={`flex items-center gap-2 mb-9 ${styles.stepIndicator}`}>

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= item
                                ? "bg-blue-500"
                                : "bg-white/10"
                                }`}
                        />
                    ))}

                </div>

                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                    <div className={styles.stepIndicatorDiv}>

                        <h1 className={`text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-3 ${styles.stepIndicatorHeading}`}>
                            <Image
                                src={logo}
                                alt="PlayTube Logo"
                                width={35}
                                height={35}
                                className={`w-9 h-9 object-contain ${styles.stepIndicatorHeadingImage}`}
                            />
                            Basic Info
                        </h1>

                        <p className={`text-gray-400 text-sm mb-8 ml-12 ${styles.stepIndicatorDescription}`}>
                            Let's start with your basic information.
                        </p>

                        <div className="space-y-5">

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username"
                                    className={`w-full bg-[#242424] border rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.username
                                        ? "border-red-500"
                                        : "border-white/10"
                                        } ${styles.inputFieldBox}`}
                                />

                                {errors.username && (
                                    <p className="text-red-500 text-xs mt-2">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email address"
                                    className={`w-full bg-[#242424] border rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.email
                                        ? "border-red-500"
                                        : "border-white/10"
                                        } ${styles.inputFieldBox}`}
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-2">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                        </div>

                        <button
                            type="button"
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl mt-8 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 ${styles.continueButton}`}
                            onClick={handleContinue}
                        >
                            Continue
                        </button>

                    </div>
                )}

                {/* STEP 2: SECURITY INFO */}
                {step === 2 && (
                    <div className={styles.stepIndicatorDiv}>

                        <h1 className={`text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-3 ${styles.stepIndicatorHeading}`}>
                            <Image
                                src={logo}
                                alt="PlayTube Logo"
                                width={35}
                                height={35}
                                className={`w-9 h-9 object-contain ${styles.stepIndicatorHeadingImage}`}
                            />
                            Security Info
                        </h1>

                        <p className={`text-gray-400 text-sm mb-8 ml-12 ${styles.stepIndicatorDescription}`}>
                            Secure your account with a strong password.
                        </p>

                        <div className="space-y-5">

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Create a password"
                                    className={`w-full bg-[#242424] border rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.password
                                        ? "border-red-500"
                                        : "border-white/10"
                                        } ${styles.inputFieldBox}`}
                                />

                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-2">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    className={`w-full bg-[#242424] border rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-white/10"
                                        } ${styles.inputFieldBox}`}
                                />

                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-2">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <div className={`flex items-center gap-2 mt-3 mb-8 ${styles.showPasswordContainer}`}>
                                <input
                                    type="checkbox"
                                    id="showPassword"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="mr-2"

                                />
                                <label htmlFor="showPassword" className="text-gray-400 text-sm">
                                    Show Password
                                </label>
                            </div>

                        </div>

                        <button
                            type="button"
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl mt-8 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 ${styles.continueButton}`}
                            onClick={handleContinue}
                        >
                            Continue
                        </button>

                    </div>
                )
                }

                {/* STEP 3: PROFILE PICTURE */}
                {
                    step === 3 && (
                        <div className={styles.stepIndicatorDiv}>

                            <h1 className={`text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-3 ${styles.stepIndicatorHeading}`}>
                                <Image
                                    src={logo}
                                    alt="PlayTube Logo"
                                    width={35}
                                    height={35}
                                    className={`w-9 h-9 object-contain ${styles.stepIndicatorHeadingImage}`}
                                />
                                Profile Picture
                            </h1>

                            <p className={`text-gray-400 text-sm mb-8 ml-12 ${styles.stepIndicatorDescription}`}>
                                Add a profile picture to personalize your account.
                            </p>

                            <div className={`flex items-center gap-6 mb-6 ${styles.profilePictureContainer}`}>
                                {
                                    frontendImage ? <img
                                        src={frontendImage}
                                        alt="Profile Picture"
                                        className={`w-16 h-16 rounded-full ${styles.userIcon}`}
                                    /> : <FaUserCircle className={`text-gray-500 w-16 h-16 p-2 ${styles.userIcon}`} />
                                }
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        name="profilePicture"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={`w-full text-sm text-gray-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/15 file:text-blue-400 file:font-medium hover:file:bg-blue-500/25 file:cursor-pointer cursor-pointer ${styles.inputFieldBox}`}
                                    />

                                    {errors.profilePicture && (
                                        <p className="text-red-500 text-xs mt-2">
                                            {errors.profilePicture}
                                        </p>
                                    )}

                                    <p className="text-gray-500 text-xs mt-2">
                                        Supported: JPG, PNG, WEBP (Max 5 MB)
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl mt-8 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 ${styles.continueButton}`}
                                onClick={handleCreateAccount}
                            >
                                Create Account
                            </button>

                        </div>
                    )
                }

                {/* Footer */}
                <div className={`mt-8 pt-6 border-t border-white/[0.07] text-center ${styles.footer}`}>

                    <p className="text-gray-500 text-xs">
                        By creating an account, you agree to our{" "}

                        <span className="text-blue-400 cursor-pointer hover:text-blue-300">
                            Terms of Service
                        </span>

                        {" "}and{" "}

                        <span className="text-blue-400 cursor-pointer hover:text-blue-300">
                            Privacy Policy
                        </span>.
                    </p>

                </div>

            </div >
        </div >
    );
};

export default RegisterNewUser;
