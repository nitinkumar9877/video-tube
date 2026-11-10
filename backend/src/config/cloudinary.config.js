const cloudinary = require('cloudinary').v2;
const configData = require("./environment.config.js");
const fs = require('fs');

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: configData.CLOUDINARY_CLOUD_NAME,
        api_key: configData.CLOUDINARY_API_KEY,
        api_secret: configData.CLOUDINARY_API_SECRET
    });
    try {
        if (!filePath) return null;
        const result = await cloudinary.uploader.upload(filePath, { resource_type: "auto" });
        // Delete the local file after successful upload
        fs.unlinkSync(filePath);
        return result.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        fs.unlinkSync(filePath); // Delete the local file even if upload fails
        throw error;
    }
};

module.exports = uploadOnCloudinary;