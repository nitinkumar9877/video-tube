const { uploadToCloudflare } = require("../services/cloudfare.services.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");
const videoUpload = async (req, res) => {
    try {
        console.log("------------videoUpload controller called------------");
        console.log("1");
        if (!req.file) {
            console.log("Request file:", req.file);
            return res.status(400).json({
                success: false,
                message: "No video file provided"
            });
        }
        console.log("2");

        const videoData = await uploadToCloudflare(req.file);
        console.log("3");
        console.log("------------videoUpload controller completed------------");
        return res.status(200).json({
            success: true,
            message: "Video uploaded successfully",
            data: videoData
        });
    } catch (error) {
        console.log("------------------ videoUpload error catch block ------------------");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Video upload failed",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
}

module.exports = { videoUpload };