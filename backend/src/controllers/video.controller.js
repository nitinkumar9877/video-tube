// const { uploadToCloudflare } = require("../services/cloudfare.services.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");
const { putVideoObjectS3 } = require("../services/videosS3.services.js");
const { putThumbnailObjectS3 } = require("../services/imageS3.services.js");
const { uploadVideoDataToMongoDB, deleteVideoFromEverywhere, updateVideoDetailsInMongoDB, likeVideoInMongoDB } = require("../services/mongoDB-video.services.js");
const VideoModel = require("../models/video.model.js");

const videoUpload = async (req, res) => {
    let videoResult = null;
    let thumbnailResult = null;

    try {
        console.log("------------videoUpload controller called------------");
        const { title, description, category, duration, tags, visibility, channelId } = req.body;
        const userId = req.user._id; // Assuming you have user authentication middleware that adds the user object to the request
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        }
        console.log("User ID:", userId);

        if (!title || !description || !category || !duration || !tags || !visibility) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Validate category
        const validCategories = ['Education', 'Entertainment', 'Music', 'Sports', 'News', 'Gaming', 'Lifestyle', 'Other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category"
            });
        };

        if (isNaN(duration) || duration <= 0) {
            return res.status(400).json({
                success: false,
                message: "Duration must be a positive number"
            });
        };
        let parsedTags = tags;

        if (typeof tags === "string") {
            try {
                parsedTags = JSON.parse(tags);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid tags format"
                });
            }
        }

        if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tags must be a non-empty array"
            });
        }

        if (!['public', 'private', 'unlisted'].includes(visibility)) {
            return res.status(400).json({
                success: false,
                message: "Invalid visibility option"
            });
        };

        // Get both files from Multer
        const videoFile = req.files?.video?.[0];
        const thumbnailFile = req.files?.thumbnailImage?.[0];

        // Validate files
        if (!videoFile || !thumbnailFile) {
            return res.status(400).json({
                success: false,
                message: "Both video and thumbnail files are required"
            });
        }

        console.log("Video:", videoFile.originalname);
        console.log("Thumbnail:", thumbnailFile.originalname);

        // Upload both files simultaneously
        const results = await Promise.allSettled([
            putVideoObjectS3(videoFile, videoFile.originalname),
            putThumbnailObjectS3(thumbnailFile, thumbnailFile.originalname)
        ]);

        // Capture successful uploads
        if (results[0].status === "fulfilled") {
            videoResult = results[0].value;
        }

        if (results[1].status === "fulfilled") {
            thumbnailResult = results[1].value;
        }

        // Check whether both uploads succeeded
        if (results.some(result => result.status === "rejected")) {

            console.log("One or more S3 uploads failed. Starting rollback.");

            // Delete successfully uploaded files
            const cleanupResults = await Promise.allSettled([
                videoResult
                    ? deleteObjectS3(videoResult.videoKey)
                    : Promise.resolve(),

                thumbnailResult
                    ? deleteObjectS3(thumbnailResult.thumbnailKey)
                    : Promise.resolve()
            ]);

            cleanupResults.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.error(
                        `S3 rollback failed for ${index === 0 ? "video" : "thumbnail"}:`,
                        result.reason
                    );
                }
            });

            const failedUpload = results.find(
                result => result.status === "rejected"
            );

            throw failedUpload.reason;
        }

        console.log("Both files uploaded successfully.");

        const payLoadData = {
            title,
            description,
            category,
            duration,
            tags: parsedTags,
            visibility,
            ...(channelId ? { channelId } : {}),
            videoUrl: videoResult.videoUrl,
            videoKey: videoResult.videoKey,
            thumbnailUrl: thumbnailResult.thumbnailUrl,
            thumbnailKey: thumbnailResult.thumbnailKey
        };

        console.log("Payload data prepared:", payLoadData);

        const response = await uploadVideoDataToMongoDB(userId, payLoadData);
        if (!response) {
            throw new Error("Failed to upload video data to MongoDB");
        }

        console.log("Video data uploaded to MongoDB successfully:", response);

        return res.status(200).json({
            success: true,
            message: "Video and thumbnail uploaded successfully",
            data: response,
            payLoadData: payLoadData
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
};

const getAllVideos = async (req, res) => {
    try {
        console.log("------------getAllVideos controller called------------");
        const videos = await VideoModel.find().populate("owner", "username").populate("channel", "name");
        return res.status(200).json({
            success: true,
            message: "Videos retrieved successfully",
            totalVideos: videos.length,
            data: videos
        });
    } catch (error) {
        console.log("------------------ getAllVideos error catch block ------------------");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve videos",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const getVideo = async (req, res) => {
    try {
        console.log("------------getVideo controller called------------");
        const videoId = req.params.id;
        const video = await VideoModel.findById(videoId).populate("owner", "username").populate("channel", "name");
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Video retrieved successfully",
            data: video
        });
    } catch (error) {
        console.log("------------------ getVideo error catch block ------------------");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve video",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const deleteVideo = async (req, res) => {
    try {
        console.log("------------deleteVideo controller start------------");
        const { key } = req.params;
        if (!key) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: key"
            });
        }
        console.log("------------deleteVideoFromEverywhere called------------");
        const result = await deleteVideoFromEverywhere(key);
        return res.status(200).json({
            success: true,
            message: "Video deleted successfully",
            data: result
        });
    } catch (error) {
        console.log("------------------ deleteVideo error catch block ------------------");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete video",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const updateVideoDetails = async (req, res) => {
    try {
        console.log("------------updateVideoDetails controller called------------");
        const videoId = req.params.key;
        console.log("1")
        const { title, description, category, tags } = req.body;
        console.log("2")
        const updateData = {};
        console.log("3")
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (tags) updateData.tags = tags;
        console.log("4")
        console.log("Video Id :", videoId);
        const response = await updateVideoDetailsInMongoDB(videoId, updateData);
        console.log("5")
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Video not found or update failed"
            });
        }

        const updatedVideo = await VideoModel.findById(videoId).populate("owner", "username").populate("channel", "name");
        console.log("6");
        console.log(updatedVideo);

        return res.status(200).json({
            success: true,
            message: "Video details updated successfully",
            data: updatedVideo
        });
    } catch (error) {
        console.log("------------------ updateVideoDetails error catch block ------------------");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update video details",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const myVideos = async (req, res) => {
    try {
        console.log("------------myVideos controller called------------");

        const userId = req.user._id; // Assuming you have user authentication middleware that adds the user object to the request
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        }
        console.log("user id : ", req.user._id); // Log the user object to verify it's being passed correctly

        const videos = await VideoModel.find({ owner: userId }).populate("channel", "name");
        console.log("Videos retrieved for user:", videos);

        return res.status(200).json({
            success: true,
            message: "User's videos retrieved successfully",
            totalVideos: videos.length,
            data: videos
        });
    } catch (error) {
        console.log("------------------ myVideos error catch block ------------------");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user's videos",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

// const likeVideo = async (req, res) => {
//     try {
//         console.log("------------likeVideo controller called------------");
//         const videoId = req.params.key;
//         const userId = req.user._id; // Assuming you have user authentication middleware that adds the user object to the request

//         if (!videoId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required field: videoId"
//             });
//         }

//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Unauthorized: User not authenticated"
//             });
//         }

//         // Call the service function to handle the like operation
//         const result = await likeVideoInMongoDB(userId, videoId);

//         return res.status(200).json({
//             success: true,
//             message: "Video liked successfully",
//             data: result
//         });
//     } catch (error) {
//         console.log("------------------ likeVideo error catch block ------------------");
//         printCatchBlockError(error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to like video",
//             error: process.env.NODE_ENV === "development"
//                 ? error.message
//                 : undefined
//         });
//     }
// };

const likeVideo = async (req, res) => {
    try {
        console.log("------------likeVideo controller called------------");

        const videoId = req.params.key;
        const userId = req.user?._id;

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: videoId"
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        }

        const result = await likeVideoInMongoDB(userId, videoId);

        return res.status(200).json({
            success: true,
            message: result.isLiked
                ? "Video liked successfully"
                : "Video unliked successfully",
            data: result
        });

    } catch (error) {
        console.log("------------------ likeVideo error catch block ------------------");
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            message: "Failed to like video",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

module.exports = { videoUpload, getAllVideos, getVideo, deleteVideo, updateVideoDetails, myVideos, likeVideo };