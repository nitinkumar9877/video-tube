
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";

import logo from "../../../assets/playTube.webp";

const RegisterNewUser = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        profilePicture: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

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
                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                    >
                        <FaArrowLeft size={18} />
                    </button>

                    <span className="text-white text-xl sm:text-2xl font-semibold tracking-tight ml-2">
                        Create Account
                    </span>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-9">

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                step >= item
                                    ? "bg-blue-500"
                                    : "bg-white/10"
                            }`}
                        />
                    ))}

                </div>

                {/* Step 1 */}
                {step === 1 && (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-3">
                            <Image
                                src={logo}
                                alt="PlayTube Logo"
                                width={35}
                                height={35}
                                className="w-9 h-9 object-contain"
                            />
                            Basic Info
                        </h1>

                        <p className="text-gray-400 text-sm mb-8 ml-12">
                            Let's start with your basic information.
                        </p>

                        <div className="space-y-5">

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    className="w-full bg-[#242424] border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    className="w-full bg-[#242424] border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl mt-8 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300"
                            onClick={() => setStep(2)}
                        >
                            Continue
                        </button>
                    </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-3">
                            <Image
                                src={logo}
                                alt="PlayTube Logo"
                                width={35}
                                height={35}
                                className="w-9 h-9 object-contain"
                            />
                            Security Info
                        </h1>

                        <p className="text-gray-400 text-sm mb-8 ml-12">
                            Secure your account with a strong password.
                        </p>

                        <div className="space-y-5">

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    className="w-full bg-[#242424] border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className="w-full bg-[#242424] border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm placeholder:text-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl mt-8 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300"
                            onClick={() => setStep(3)}
                        >
                            Continue
                        </button>
                    </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-3">
                            <Image
                                src={logo}
                                alt="PlayTube Logo"
                                width={35}
                                height={35}
                                className="w-9 h-9 object-contain"
                            />
                            Profile Picture
                        </h1>

                        <p className="text-gray-400 text-sm mb-8 ml-12">
                            Add a profile picture to personalize your account.
                        </p>

                        <div className="border-2 border-dashed border-white/15 bg-[#242424]/70 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all duration-300">

                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-blue-400"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>

                            <h3 className="text-white font-medium mb-2">
                                Upload Profile Picture
                            </h3>

                            <p className="text-gray-500 text-xs mb-5">
                                Choose an image from your device.
                            </p>

                            <input
                                type="file"
                                name="profilePicture"
                                accept="image/*"
                                className="w-full text-sm text-gray-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/15 file:text-blue-400 file:font-medium hover:file:bg-blue-500/25 file:cursor-pointer cursor-pointer"
                            />

                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl mt-8 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300"
                            onClick={() => alert("Account created!")}
                        >
                            Create Account
                        </button>
                    </>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/[0.07] text-center">
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

            </div>
        </div>
    );
};

export default RegisterNewUser;
