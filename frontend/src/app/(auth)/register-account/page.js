
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
    FaArrowLeft,
    FaUserCircle,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaImage,
} from "react-icons/fa";

import { ClipLoader } from "react-spinners";

import styles from "../../../components/styleSheets/register.module.css";
import logo from "../../../assets/playTube.webp";
import { AuthRegisterUser } from "@/services/AuthUser";

const RegisterNewUser = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [backendImage, setBackendImage] = useState(null);
    const [frontendImage, setFrontendImage] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Clean up preview URL
    useEffect(() => {
        return () => {
            if (frontendImage) {
                URL.revokeObjectURL(frontendImage);
            }
        };
    }, [frontendImage]);

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
            general: "",
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

        const { password, confirmPassword } = formData;

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters";
        } else if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            newErrors.password =
                "Include uppercase, lowercase, number and symbol";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Navigate between steps
    const handleContinue = () => {
        if (step === 1 && validateStepOne()) {
            setStep(2);
        } else if (step === 2 && validateStepTwo()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setErrors({});
        setStep((prev) => Math.max(1, prev - 1));
    };

    // Handle profile picture
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors({
                profilePicture:
                    "Only JPG, PNG and WEBP images are allowed",
            });
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors({
                profilePicture:
                    "Image size must be less than 5 MB",
            });
            e.target.value = "";
            return;
        }

        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));

        setErrors((prev) => ({
            ...prev,
            profilePicture: "",
            general: "",
        }));
    };

    // Final registration
    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!backendImage) {
            setErrors({
                profilePicture: "Please upload a profile picture",
            });
            return;
        }

        try {
            setIsLoading(true);
            setErrors({});

            const data = new FormData();

            data.append("username", formData.username.trim());
            data.append("email", formData.email.trim());
            data.append("password", formData.password);
            data.append("avatar", backendImage);

            const response = await AuthRegisterUser(data);

            console.log("Registration successful:", response);
            setIsLoading(false);

            alert("Account created successfully!");

        } catch (error) {
            setIsLoading(false);

            console.error(
                "Registration failed:",
                error.response?.data || error.message
            );

            setErrors({
                general:
                    error.response?.data?.message ||
                    "Unable to create your account. Please try again.",
            });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.registerPage}>

            {/* Background Effects */}
            <div className={styles.backgroundEffectOne}></div>
            <div className={styles.backgroundEffectTwo}></div>

            {/* Registration Card */}
            <div className={styles.registerCard}>

                {/* Header */}
                <div className={styles.header}>

                    <div className={styles.headerTop}>

                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={step === 1 || isLoading}
                            className={styles.backButton}
                            aria-label="Go back"
                        >ady have an ac
                            <FaArrowLeft />
                        </button>

                        <span>Create Account</span>

                    </div>

                    <div className={styles.logoContainer}>
                        <Image
                            src={logo}
                            alt="PlayTube Logo"
                            width={55}
                            height={55}
                            className={styles.logo}
                        />
                    </div>

                    <h1>Join PlayTube</h1>

                    <p>
                        Create your account and start exploring.
                    </p>

                </div>

                {/* Step Indicator */}
                <div className={styles.stepIndicator}>

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={`${styles.stepBar} ${
                                step >= item ? styles.activeStep : ""
                            }`}
                        />
                    ))}

                </div>

                <div className={styles.stepCount}>
                    Step {step} of 3
                </div>

                {/* General Error */}
                {errors.general && (
                    <div className={styles.generalError}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleCreateAccount}>

                    {/* STEP 1: BASIC INFORMATION */}
                    {step === 1 && (
                        <section className={styles.stepIndicatorDiv}>

                            <div className={styles.stepHeading}>

                                <h2 className={styles.stepIndicatorHeading}>
                                    <FaUser className={styles.headingIcon} />
                                    Basic Information
                                </h2>

                                <p className={styles.stepIndicatorDescription}>
                                    Let's start with your basic information.
                                </p>

                            </div>

                            {/* Username */}
                            <div className={styles.inputFieldBox}>

                                <label htmlFor="username">
                                    Username
                                </label>

                                <div className={styles.inputWrapper}>
                                    <FaUser className={styles.inputIcon} />

                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        maxLength={20}
                                        className={
                                            errors.username
                                                ? styles.inputError
                                                : ""
                                        }
                                    />
                                </div>

                                {errors.username && (
                                    <p className={styles.errorMessage}>
                                        {errors.username}
                                    </p>
                                )}

                            </div>

                            {/* Email */}
                            <div className={styles.inputFieldBox}>

                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className={styles.inputWrapper}>
                                    <FaEnvelope className={styles.inputIcon} />

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email address"
                                        autoComplete="email"
                                        className={
                                            errors.email
                                                ? styles.inputError
                                                : ""
                                        }
                                    />
                                </div>

                                {errors.email && (
                                    <p className={styles.errorMessage}>
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            <button
                                type="button"
                                onClick={handleContinue}
                                className={styles.continueButton}
                            >
                                Continue
                            </button>

                        </section>
                    )}

                    {/* STEP 2: SECURITY INFORMATION */}
                    {step === 2 && (
                        <section className={styles.stepIndicatorDiv}>

                            <div className={styles.stepHeading}>

                                <h2 className={styles.stepIndicatorHeading}>
                                    <FaLock className={styles.headingIcon} />
                                    Security Information
                                </h2>

                                <p className={styles.stepIndicatorDescription}>
                                    Create a strong password for your account.
                                </p>

                            </div>

                            {/* Password */}
                            <div className={styles.inputFieldBox}>

                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className={styles.inputWrapper}>
                                    <FaLock className={styles.inputIcon} />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        className={
                                            errors.password
                                                ? styles.inputError
                                                : ""
                                        }
                                    />
                                </div>

                                {errors.password && (
                                    <p className={styles.errorMessage}>
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* Confirm Password */}
                            <div className={styles.inputFieldBox}>

                                <label htmlFor="confirmPassword">
                                    Confirm Password
                                </label>

                                <div className={styles.inputWrapper}>
                                    <FaLock className={styles.inputIcon} />

                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        className={
                                            errors.confirmPassword
                                                ? styles.inputError
                                                : ""
                                        }
                                    />
                                </div>

                                {errors.confirmPassword && (
                                    <p className={styles.errorMessage}>
                                        {errors.confirmPassword}
                                    </p>
                                )}

                            </div>

                            {/* Show Password */}
                            <div className={styles.showPasswordContainer}>

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={(e) =>
                                            setShowPassword(e.target.checked)
                                        }
                                    />

                                    <span>Show Password</span>
                                </label>

                            </div>

                            <button
                                type="button"
                                onClick={handleContinue}
                                className={styles.continueButton}
                            >
                                Continue
                            </button>

                        </section>
                    )}

                    {/* STEP 3: PROFILE PICTURE */}
                    {step === 3 && (
                        <section className={styles.stepIndicatorDiv}>

                            <div className={styles.stepHeading}>

                                <h2 className={styles.stepIndicatorHeading}>
                                    <FaImage className={styles.headingIcon} />
                                    Profile Picture
                                </h2>

                                <p className={styles.stepIndicatorDescription}>
                                    Add a profile picture to personalize your account.
                                </p>

                            </div>

                            <div className={styles.profilePictureContainer}>

                                <div className={styles.profilePreview}>

                                    {frontendImage ? (
                                        <img
                                            src={frontendImage}
                                            alt="Profile preview"
                                            className={styles.userIcon}
                                        />
                                    ) : (
                                        <FaUserCircle
                                            className={styles.userIcon}
                                        />
                                    )}

                                </div>

                                <div className={styles.uploadContent}>

                                    <label
                                        htmlFor="profilePicture"
                                        className={styles.uploadButton}
                                    >
                                        <FaImage />
                                        Choose Image
                                    </label>

                                    <input
                                        id="profilePicture"
                                        type="file"
                                        name="profilePicture"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        hidden
                                    />

                                    <p>
                                        JPG, PNG or WEBP
                                    </p>

                                    <p>
                                        Maximum file size: 5 MB
                                    </p>

                                </div>

                            </div>

                            {backendImage && (
                                <p className={styles.selectedFile}>
                                    {backendImage.name}
                                </p>
                            )}

                            {errors.profilePicture && (
                                <p className={styles.errorMessage}>
                                    {errors.profilePicture}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={styles.continueButton}
                            >
                                {isLoading ? (
                                    <>
                                        <ClipLoader
                                            color="#ffffff"
                                            size={18}
                                        />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>

                        </section>
                    )}

                </form>

                {/* Footer */}
                <div className={styles.footer}>

                    <p>
                        Already have an account?
                        <Link href="/login">
                            Sign In
                        </Link>
                    </p>

                    <div className={styles.termsText}>
                        By creating an account, you agree to our{" "}
                        <Link href="/terms">
                            Terms of Service
                        </Link>
                        {" "}and{" "}
                        <Link href="/privacy">
                            Privacy Policy
                        </Link>.
                    </div>

                </div>

            </div>

        </main>
    );
};

export default RegisterNewUser;
