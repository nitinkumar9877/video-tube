const dotenv = require("dotenv");
dotenv.config();

if (!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables");
}

if (!process.env.MONGODBURL) {
    throw new Error("MONGODBURL is not defined in the environment variables");
}

if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in the environment variables");
}

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in the environment variables");
}

if (!process.env.NODE_ENV) {
    throw new Error("NODE_ENV is not defined in the environment variables");
}

const configData = {
    PORT: process.env.PORT,
    MONGODBURL: process.env.MONGODBURL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    IMAGEKIT_URL_ENDPOINT_URL: process.env.IMAGEKIT_URL_ENDPOINT_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
}
module.exports = configData;