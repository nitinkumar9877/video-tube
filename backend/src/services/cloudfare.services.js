const Formdata = require("form-data");
const axios = require("axios");
const configData = require("../config/multer.config.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const uploadToCloudflare = async (file) => {
    try {
        const formData = new Formdata();
        formData.append("file", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${configData.CLOUDFLARE_ACCOUNT_ID}/stream`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${configData.CLOUDFLARE_API_TOKEN}`,
                    ...formData.getHeaders(),
                },
                maxBodyLength: Infinity,
            }
        );

        const video = response.data.result;

        return {
            videoId: video.uid,
            videoUrl: `https://iframe.videodelivery.net/${video.uid}`,
            thumbnailUrl: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg`,
        };
    } catch (error) {
        printCatchBlockError(error);
        console.error(
            "Cloudflare upload error:",
            error.response?.data || error.message
        );

        throw new Error("Video upload failed");
    }
};


module.exports = { uploadToCloudflare };