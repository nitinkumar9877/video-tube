/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "youtube-clone-project-145.s3.us-east-1.amazonaws.com",
                pathname: "/profile-images/**",
            },
        ],
    },
};

module.exports = nextConfig;