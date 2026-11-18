const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Credentials = require("../config/s3-credentials.config.js");
const configData = require("../config/environment.config.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const putThumbnailObjectS3 = async (file, fileName) => {
    try {
        const params = {
            Bucket: configData.AWS_BUCKET_NAME,

            // Upload inside thumbnails folder
            Key: `thumbnails/${fileName}`,
            // Actual file data
            Body: file.buffer,

            // File MIME type
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);

        const response = await s3Credentials.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error("Failed to upload thumbnail to S3");
        }

        const fileUrl = `https://${configData.AWS_BUCKET_NAME}.s3.${configData.AWS_REGION}.amazonaws.com/${params.Key}`;

        console.log("Thumbnail uploaded successfully to S3:", fileUrl);

        return {
            thumbnailKey: params.Key,
            thumbnailUrl: fileUrl
        };

    } catch (error) {
        printCatchBlockError(error);
        throw error;
    }
};

const getThumbnailObjectS3 = async (key) => {
    try {
        const params = {
            Bucket: configData.AWS_BUCKET_NAME,
            Key: key,
        };

        const command = new GetObjectCommand(params);

        const response = await s3Credentials.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error("Failed to retrieve thumbnail from S3");
        }

        return response.Body;

    } catch (error) {
        printCatchBlockError(error);
        throw error;
    }
};

const deleteThumbnailObjectS3 = async (key) => {
    try {
        const params = {
            Bucket: configData.AWS_BUCKET_NAME,
            Key: key,
        };

        const command = new DeleteObjectCommand(params);

        const response = await s3Credentials.send(command);

        if (response.$metadata.httpStatusCode !== 204) {
            throw new Error("Failed to delete thumbnail file from S3");
        }

        console.log("thumbnail deleted successfully from S3:", key);

    } catch (error) {
        printCatchBlockError(error);
        throw error;
    }
};

module.exports = { putThumbnailObjectS3, getThumbnailObjectS3, deleteThumbnailObjectS3 };