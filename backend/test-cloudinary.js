
const cloudinary = require("cloudinary").v2;
const configData = require("./src/config/environment.config");
const path = require("path");

cloudinary.config({
    cloud_name: configData.CLOUDINARY_CLOUD_NAME,
    api_key: configData.CLOUDINARY_API_KEY,
    api_secret: configData.CLOUDINARY_API_SECRET
});

async function testUpload() {
    try {
        const imagePath = path.join(__dirname, "uploads", "test.png");

        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "testUploads",
            resource_type: "image"
        });

        console.log("UPLOAD SUCCESS!");
        console.log("URL:", result.secure_url);

    } catch (error) {
        console.error("UPLOAD FAILED!");

        console.dir(error, {
            depth: 5,
            colors: true
        });

        console.log("HTTP CODE:", error.http_code);
        console.log("ERROR DETAILS:", error.error);
        console.log("RESPONSE:", error.response?.body);
        console.log("HEADERS:", error.response?.headers);
    }
}

testUpload();
