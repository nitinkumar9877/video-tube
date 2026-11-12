const dotenv = require("dotenv");
dotenv.config();

if (!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables");
}
if (!process.env.MONGODBURL) {
    throw new Error("MONGODBURL is not defined in the environment variables");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

if (!process.env.IMAGEKIT_URL_ENDPOINT_URL) {
    throw new Error("IMAGEKIT_URL_ENDPOINT_URL is not defined in the environment variables");
}
if (!process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error("IMAGEKIT_PUBLIC_KEY is not defined in the environment variables");
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in the environment variables");
}

const configData = {
    PORT: process.env.PORT,
    MONGODBURL: process.env.MONGODBURL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    IMAGEKIT_URL_ENDPOINT_URL: process.env.IMAGEKIT_URL_ENDPOINT_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY
}
module.exports = configData;