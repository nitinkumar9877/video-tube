"use client";

export default function GoogleLogin() {

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="google-login-btn"
        >
            Continue with Google
        </button>
    );
}