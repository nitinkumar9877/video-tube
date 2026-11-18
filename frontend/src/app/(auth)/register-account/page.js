"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaLock,
} from "react-icons/fa";

import { ClipLoader } from "react-spinners";

import styles from "../../../components/styleSheets/register.module.css";
import logo from "../../../assets/playTube.webp";
import { AuthRegisterUser } from "@/services/AuthUser";

// Initial form state
const INITIAL_FORM_DATA = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
};

// Validate username and email
const validateBasicInfo = ({ username, email }) => {
    const errors = {};

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
        errors.username = "Username is required";
    } else if (cleanUsername.length < 3) {
        errors.username = "Username must be at least 3 characters";
    } else if (cleanUsername.length > 20) {
        errors.username = "Username cannot exceed 20 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        errors.username =
            "Only letters, numbers and underscores are allowed";
    }

    if (!cleanEmail) {
        errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        errors.email = "Please enter a valid email address";
    }

    return errors;
};

// Validate password
const validatePassword = ({ password, confirmPassword }) => {
    const errors = {};

    if (!password) {
        errors.password = "Password is required";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    } else if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
    ) {
        errors.password =
            "Include uppercase, lowercase, number and symbol";
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};

// Identify duplicate registration errors
const getRegistrationError = (error) => {
    const data = error?.response?.data || error?.data || {};

    const message =
        data.message ||
        data.error?.message ||
        data.error ||
        error.message ||
        "Unable to create your account. Please try again.";

    const status = error?.response?.status;

    const keyPattern = data.keyPattern || data.error?.keyPattern || {};
    const keyValue = data.keyValue || data.error?.keyValue || {};

    const combinedMessage =
        typeof message === "string"
            ? message
            : JSON.stringify(message);

    const isDuplicate =
        status === 409 ||
        data.code === 11000 ||
        data.error?.code === 11000 ||
        /already exists|already registered|duplicate key|e11000/i.test(
            combinedMessage
        );

    if (!isDuplicate) {
        return {
            general: combinedMessage,
            fieldErrors: {},
        };
    }

    // Determine which field already exists
    const duplicateText = [
        combinedMessage,
        JSON.stringify(keyPattern),
        JSON.stringify(keyValue),
    ].join(" ").toLowerCase();

    const fieldErrors = {};

    if (duplicateText.includes("email")) {
        fieldErrors.email = "This email address is already registered.";
    }

    if (duplicateText.includes("username")) {
        fieldErrors.username = "This username is already taken.";
    }

    return {
        general:
            Object.keys(fieldErrors).length > 0
                ? "Please use different registration details."
                : "An account with these details already exists.",
        fieldErrors,
    };
};

const RegisterNewUser = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const [errors, setErrors] = useState({});

    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    // Handle input changes
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

        setSuccessMessage("");
    };

    // Step 1 validation
    const handleContinue = () => {
        const validationErrors = validateBasicInfo(formData);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setStep(2);
        }
    };

    // Back button
    const handleBack = () => {
        if (isLoading) return;

        setErrors({});
        setStep(1);
    };

    // Register account
    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        // Validate basic information
        const basicErrors = validateBasicInfo(formData);

        if (Object.keys(basicErrors).length > 0) {
            setErrors(basicErrors);
            setStep(1);
            return;
        }

        // Validate password
        const passwordErrors = validatePassword(formData);

        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;
        }

        try {
            setIsLoading(true);
            setErrors({});
            setSuccessMessage("");

            // API payload
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
            };

            const response = await AuthRegisterUser(payload);

            // Handle APIs that return success: false
            const responseData = response?.data ?? response;

            if (responseData?.success === false) {
                const apiError = new Error(
                    responseData.message || "Registration failed"
                );

                apiError.response = {
                    status: response?.status,
                    data: responseData,
                };

                throw apiError;
            }

            console.log("Registration successful:", responseData);

            setSuccessMessage(
                "Account created successfully! You can now sign in."
            );

            setFormData(INITIAL_FORM_DATA);
            setStep(1);
            setShowPassword(false);

        } catch (error) {
            console.error(
                "Registration error:",
                error?.response?.data || error
            );

            const registrationError = getRegistrationError(error);

            setErrors({
                general: registrationError.general,
                ...registrationError.fieldErrors,
            });

            // Move to basic information if username/email is duplicate
            if (
                registrationError.fieldErrors.email ||
                registrationError.fieldErrors.username
            ) {
                setStep(1);
            }

        } finally {
            setIsLoading(false);
        }
    };

    // Form submission
    const handleSubmit = (e) => {
        if (step === 1) {
            e.preventDefault();
            handleContinue();
            return;
        }

        handleCreateAccount(e);
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
                        >
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
                            priority
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
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className={`${styles.stepBar} ${
                                step >= item ? styles.activeStep : ""
                            }`}
                        />
                    ))}
                </div>

                <div className={styles.stepCount}>
                    Step {step} of 2
                </div>

                {/* General Error */}
                {errors.general && (
                    <div
                        className={styles.generalError}
                        role="alert"
                    >
                        {errors.general}
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div role="status">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <section className={styles.stepIndicatorDiv}>

                            <div className={styles.stepHeading}>
                                <h2 className={styles.stepIndicatorHeading}>
                                    <FaUser className={styles.headingIcon} />
                                    Basic Information
                                </h2>

                                <p className={styles.stepIndicatorDescription}>
                                    Let&apos;s start with your basic information.
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
                                        minLength={3}
                                        required
                                        aria-invalid={!!errors.username}
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
                                        required
                                        aria-invalid={!!errors.email}
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
                                type="submit"
                                className={styles.continueButton}
                            >
                                Continue
                            </button>

                        </section>
                    )}

                    {/* STEP 2 */}
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
                                        required
                                        aria-invalid={!!errors.password}
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
                                        required
                                        aria-invalid={!!errors.confirmPassword}
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

                            {/* Submit */}
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
                        Already have an account?{" "}
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
