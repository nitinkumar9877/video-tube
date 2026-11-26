const multer = require("multer");
const { uploadImgMulter, uploadVideoMulter, upload } = require("../config/multer.config.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");

const uploadAvatar = (req, res, next) => {
    uploadImgMulter.single("avatar")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError || error.message === "Only JPEG, PNG, and WebP images are allowed") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return next(error);
    });
};

const uploadImage = (req, res, next) => {
    try {
        console.log("------------uploadImage middleware called------------");
        uploadImgMulter.single("Image")(req, res, (error) => {
            if (!error) {
                return next();
            }
            printCatchBlockError(error);
            if (error instanceof multer.MulterError || error.message === "Only JPEG, PNG, and WebP images are allowed") {
                return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
                    success: false,
                    block: 'middleware',
                    message: error.message
                });
            }
            console.log("------------uploadImage middleware error------------");
            return next(error);
        });

    } catch (error) {
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            block: 'middleware',
            message: "An unexpected error occurred in the uploadImage middleware"
        });
    }
};

const uploadVideo = (req, res, next) => {
    try {
        console.log("------------uploadVideo middleware called------------");
        uploadVideoMulter.single("video")(req, res, (error) => {
            if (!error) {
                return next();
            }
            printCatchBlockError(error);
            if (error instanceof multer.MulterError || error.message === "Only MP4, AVI, and MOV videos are allowed") {
                return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            console.log("------------uploadVideo middleware error------------");

            return next(error);
        });
    }
    catch (error) {
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred in the uploadVideo middleware"
        });
    }
   
};


const uploadVideoAndThumbnail = (req, res, next) => {
    try {
        console.log("------------uploadVideoAndThumbnail middleware called------------");

        upload.fields([
            {
                name: "video",
                maxCount: 1
            },
            {
                name: "thumbnailImage",
                maxCount: 1
            }
        ])(req, res, (error) => {

            if (!error) {
                return next();
            }

            printCatchBlockError(error);

            if (
                error instanceof multer.MulterError ||
                error.message === "Only JPEG, PNG, and WebP images are allowed" ||
                error.message === "Only MP4, AVI, and MOV videos are allowed"
            ) {
                return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
                    success: false,
                    block: "middleware",
                    message: error.message
                });
            }

            console.log("------------uploadVideoAndThumbnail middleware error------------");

            return next(error);
        });

    } catch (error) {

        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            block: "middleware",
            message: "An unexpected error occurred during file upload"
        });
    }
};

module.exports = { uploadVideo, uploadAvatar, uploadImage, uploadVideoAndThumbnail };
