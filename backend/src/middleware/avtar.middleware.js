const multer = require("multer");
const { uploadImgMulter } = require("../config/multer.config.js");

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

module.exports = { uploadAvatar };
