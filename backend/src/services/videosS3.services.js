const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Credentials = require("../config/s3-credentials.config.js");
const configData = require("../config/environment.config.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const putVideoObjectS3 = async (file, fileName) => {
    try {
        const params = {
            Bucket: configData.AWS_BUCKET_NAME,

            // Upload inside videos folder
            Key: `videos/${fileName}`,

            // Actual file data
            Body: file.buffer,

            // File MIME type
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);

        const response = await s3Credentials.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error("Failed to upload file to S3");
        }

        const fileUrl = `https://${configData.AWS_BUCKET_NAME}.s3.${configData.AWS_REGION}.amazonaws.com/${params.Key}`;

        console.log("File uploaded successfully to S3:", fileUrl);

        return {
            videoKey: params.Key,
            videoUrl: fileUrl
        };

    } catch (error) {
        printCatchBlockError(error);
        throw error;
    }
};

const getVideoObjectS3 = async (key) => {
    try {
        const params = {
            Bucket: configData.AWS_BUCKET_NAME,
            Key: key,
        };

        const command = new GetObjectCommand(params);

        const response = await s3Credentials.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error("Failed to retrieve file from S3");
        }

        return response.Body;

    } catch (error) {
        printCatchBlockError(error);
        throw error;
    }
};

module.exports = { putVideoObjectS3, getVideoObjectS3 };