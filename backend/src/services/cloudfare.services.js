const Formdata = require("form-data");
const axios = require("axios");
const configData = require("../config/environment.config.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const uploadToCloudflare = async (file) => {
    try {
        const formData = new Formdata();
        formData.append("file", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });
        console.log("------------uploadToCloudflare service called------------");
        console.log("Request file:", file);
        console.log("FormData:", formData);
        console.log("configData.CLOUDFLARE_ACCOUNT_ID",configData.CLOUDFLARE_ACCOUNT_ID);
        console.log("configData.CLOUDFLARE_API_TOKEN",configData.CLOUDFLARE_API_TOKEN);
        
        console.log("----------------------------------------------------------------------------------");
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${configData.CLOUDFLARE_ACCOUNT_ID}/stream`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${configData.CLOUDFLARE_API_TOKEN}`
                }
            }
        );
        console.log("API hit to cloudflare");
        if (response.data && response.data.success) {
            console.log("Successfully.....!!!");
            return response.data.result;
        } else {
            console.log("Failed.....!!! ");
            throw new Error("Failed to upload video to Cloudflare");
        }
    } catch (error) {
        console.log("------------------ uploadToCloudflare error catch block ------------------");
        printCatchBlockError(error);
        throw error;
    }   
};


module.exports = { uploadToCloudflare };