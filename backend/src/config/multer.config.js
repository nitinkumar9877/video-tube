const multer = require("multer");

const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/*"
]);

const uploadImgMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
            return callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
        }

        return callback(null, true);
    }
});

const uploadVideoMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) {
            return cb(new Error("Only video files are allowed"));
        }

        cb(null, true);
    },
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (file.fieldname === "video") {

            if (!["video/mp4", "video/avi", "video/quicktime"].includes(file.mimetype)) {
                return cb(new Error("Only MP4, AVI, and MOV videos are allowed"));
            }

        } else if (file.fieldname === "thumbnailImage") {

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
                return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
            }

        } else {
            return cb(new Error("Unexpected file field"));
        }

        cb(null, true);
    }
});

module.exports = { uploadImgMulter, uploadVideoMulter, upload };