"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserCircle, FaLock, FaEnvelope } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

import styles from "../../../components/styleSheets/login.module.css";
import logo from "../../../assets/playTube.webp";
import { AuthLoginUser } from "@/services/AuthUser";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        const email = formData.email.trim();
        const password = formData.password;

        if (!email) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);
            setErrors({});

            const response = await AuthLoginUser({
                email: formData.email.trim(),
                password: formData.password,
            });

            console.log("Login successful:", response);

            // Add your redirect logic here.
            // Example: router.push("/");

        } catch (error) {
            console.error(
                "Login failed:",
                error.response?.data || error.message
            );

            setErrors({
                general:
                    error.response?.data?.message ||
                    "Invalid email or password. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.loginPage}>

            {/* Background Effects */}
            <div className={styles.backgroundEffectOne}></div>
            <div className={styles.backgroundEffectTwo}></div>

            {/* Login Card */}
            <div className={styles.loginCard}>

                {/* Header */}
                <div className={styles.loginHeader}>

                    <div className={styles.logoContainer}>
                        <Image
                            src={logo}
                            alt="PlayTube Logo"
                            width={55}
                            height={55}
                            className={styles.logo}
                        />
                    </div>

                    <h1>Welcome Back</h1>

                    <p>
                        Sign in to continue watching your favorite videos.
                    </p>

                </div>

                {/* Login Form */}
                <form
                    onSubmit={handleLogin}
                    className={styles.loginForm}
                >

                    {/* General Error */}
                    {errors.general && (
                        <div className={styles.generalError}>
                            {errors.general}
                        </div>
                    )}

                    {/* Email */}
                    <div className={styles.formGroup}>

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

                    {/* Password */}
                    <div className={styles.formGroup}>

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
                                placeholder="Enter your password"
                                autoComplete="current-password"
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

                    {/* Password Options */}
                    <div className={styles.passwordOptions}>

                        <label className={styles.showPassword}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) =>
                                    setShowPassword(e.target.checked)
                                }
                            />

                            <span>Show Password</span>
                        </label>

                        <Link
                            href="/forgot-password"
                            className={styles.forgotPassword}
                        >
                            Forgot Password?
                        </Link>

                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ClipLoader
                                color="#ffffff"
                                size={20}
                            />
                        ) : (
                            "Sign In"
                        )}
                    </button>

                </form>

                {/* Register Link */}
                <div className={styles.registerSection}>

                    <p>
                        Don't have an account?
                        <Link href="/register-account">
                            Create Account
                        </Link>
                    </p>

                </div>

                {/* Footer */}
                <div className={styles.footer}>

                    <p>
                        By signing in, you agree to our
                        <Link href="/terms"> Terms of Service </Link>
                        and
                        <Link href="/privacy"> Privacy Policy</Link>.
                    </p>

                </div>

            </div>

        </main>
    );
};

export default LoginPage;