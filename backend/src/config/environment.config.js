const dotenv = require("dotenv");
dotenv.config();

if (!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables");
}
if (!process.env.MONGODBURL) {
    throw new Error("MONGODBURL is not defined in the environment variables");
}

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not defined in the environment variables");
}
if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error("CLOUDINARY_API_KEY is not defined in the environment variables");
}
if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is not defined in the environment variables");
}

if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

const configData = {
    PORT: process.env.PORT,
    MONGODBURL: process.env.MONGODBURL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    JWT_SECRET: process.env.JWT_SECRET
}
module.exports = configData;