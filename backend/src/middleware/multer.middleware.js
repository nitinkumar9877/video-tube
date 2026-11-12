const multer = require("multer");

const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
            return callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
        }

        return callback(null, true);
    }
});

const uploadAvatar = (req, res, next) => {
    upload.single("avatar")(req, res, (error) => {
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

module.exports = uploadAvatar;
