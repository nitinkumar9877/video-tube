const cloudinary = require("cloudinary").v2;
const configData = require("./environment.config.js");
const fs = require("fs");

cloudinary.config({
    cloud_name: configData.CLOUDINARY_CLOUD_NAME,
    api_key: configData.CLOUDINARY_API_KEY,
    api_secret: configData.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    if (!filePath) return null;

    try {
        console.log("---------------------- Welcome to uploadOnCloudinary function ---------------------------");
        const fs = require("fs");
        console.log("cloud Config:", cloudinary.config());

        console.log("File path:", filePath);
        console.log("File exists:", fs.existsSync(filePath));

        if (fs.existsSync(filePath)) {
            console.log("File size:", fs.statSync(filePath).size);
        }
        const fileName = filePath.split("/").pop();

        const localFilePath = `uploads/${fileName}`;
        console.log("Local file path:", localFilePath);

        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: "uploads",
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });

        console.log("Cloudinary upload successful:", {
            public_id: result.public_id,
            secure_url: result.secure_url
        });

        return result.secure_url;

    } catch (error) {
        console.error("Cloudinary Upload Failed:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            error: error.error
        });

        throw error;

    } finally {
        if (fs.existsSync(localFilePath)) {
            await fs.promises.unlink(localFilePath).catch(err => {
                console.error("Local file cleanup failed:", err.message);
            });
        }
    }
};

module.exports = uploadOnCloudinary;
