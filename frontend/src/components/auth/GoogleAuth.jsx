"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { AuthGoogleUser } from "@/services/AuthUser";
import { useState } from "react";

export default function GoogleLoginButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setError("");

            const credential = credentialResponse?.credential;

            if (!credential) {
                throw new Error("Google did not return a credential.");
            }

            const response = await AuthGoogleUser(credential);

            if (!response?.success) {
                throw new Error(
                    response?.message || "Google login failed."
                );
            }

            // Backend has now created the login session cookie.
            // Reloading lets AppShell check the user's login status.
            window.location.assign("/user");

        } catch (error) {
            console.error("Google login error:", error);

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to login with Google."
            );

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    setError("Google authentication was unsuccessful.");
                }}
                useOneTap={false}
            />

            {isLoading && <p>Signing in...</p>}

            {error && (
                <p role="alert" style={{ color: "red" }}>
                    {error}
                </p>
            )}
        </div>
    );
}