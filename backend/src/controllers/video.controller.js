// const { uploadToCloudflare } = require("../services/cloudfare.services.js");
const { printCatchBlockError } = require("../utils/errorPrint.utils.js");
const { putVideoObjectS3 } = require("../services/videosS3.services.js");
const { putThumbnailObjectS3 } = require("../services/imageS3.services.js");
const { deleteVideoObjectS3 } = require("../services/videosS3.services.js");
const { deleteThumbnailObjectS3 } = require("../services/imageS3.services.js");
const { uploadVideoDataToMongoDB, deleteVideoFromEverywhere, updateVideoDetailsInMongoDB, likeVideoInMongoDB } = require("../services/mongoDB-video.services.js");
const VideoModel = require("../models/video.model.js");
// import CommentModel from "../models/comment.model.js";
const CommentModel = require("../models/comments.model.js");

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
                    ? deleteVideoObjectS3(videoResult.videoKey)
                    : Promise.resolve(),

                thumbnailResult
                    ? deleteThumbnailObjectS3(thumbnailResult.thumbnailKey)
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
        const video = await VideoModel.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } },
            { new: true }
        ).populate("owner", "username").populate("channel", "name");
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

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        }

        const video = await VideoModel.findById(key);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        if (String(video.owner) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this video"
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
        const { title, description, category, tags } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (tags) updateData.tags = tags;
        console.log("Video Id :", videoId);
        console.log("Update Data :", updateData);
        const response = await updateVideoDetailsInMongoDB(videoId, updateData);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Video not found or update failed"
            });
        }

        const updatedVideo = await VideoModel.findById(videoId).populate("owner", "username").populate("channel", "name");
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

const createVideoComments = async (req, res) => {
    try {
        console.log("------------VideoComments controller called------------");
        const videoId = req.params.key;
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: videoId"
            });
        };
        console.log("1");
        const { comment } = req.body;
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: comment"
            });
        };
        console.log("2");
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        };
        console.log("3");
        const video = await VideoModel.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        console.log("4");
        console.log("Video ID:", videoId);
        console.log("User ID:", userId);
        console.log("Comment:", comment);
        const newComment = await CommentModel.create({
            user: req.user._id,
            video: videoId,
            comment: comment,
        });

        const updatedVideo = await VideoModel.findByIdAndUpdate(
            videoId,
            { $push: { comments: newComment._id } },
            { new: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({
                success: false,
                message: "Video not found or failed to update comments"
            });
        };

        console.log("5");
        if (!newComment._id) {
            return res.status(500).json({
                success: false,
                message: "Failed to create comment"
            });
        };
        console.log("6");
        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: newComment
        });
    } catch (error) {
        console.log("------------------ VideoComments error catch block ------------------");
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit video comment",
            error: error,
            errorMsg: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
}

const getVideoComments = async (req, res) => {
    try {
        console.log("------------getVideoComments controller called------------");
        const videoId = req.params.key;
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: videoId"
            });
        };

        const comments = await CommentModel.find({ video: videoId });
        if (!comments) {
            return res.status(200).json({
                success: true,
                message: "No comments found for this video"
            });
        };
        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments
        });
    }
    catch (error) {
        console.log("------------------ getVideoComments error catch block ------------------");
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch video comments",
            error: error,
            errorMsg: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
}

const deleteVideoComments = async (req, res) => {
    try {
        console.log("------------deleteVideoComments controller called------------");
        const { key, commentId } = req.params;
        if (!key || !commentId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: videoId or commentId"
            });
        };

        const video = await VideoModel.findById(key);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        };

        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        };
        // what to check comment id is present in the video comments array or not
        if (!video.comments.includes(commentId)) {
            return res.status(400).json({
                success: false,
                message: "Comment does not belong to this video"
            });
        };
        if (!comment.user.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own comments"
            });
        };

        await CommentModel.findByIdAndDelete(commentId);
        await VideoModel.findByIdAndUpdate(key, { $pull: { comments: commentId } });
        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.log("------------------ deleteVideoComments error catch block ------------------");
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete comment",
            error: error,
            errorMsg: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const getMyLikedVideos = async (req, res) => {
    try {
        console.log("------------getMyLikedVideos controller called------------");
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        };
        const likedVideos = await VideoModel.find({ likes: userId });
        return res.status(200).json({
            success: true,
            message: "Liked videos fetched successfully",
            data: likedVideos
        });
    } catch (error) {
        console.log("------------------ getMyLikedVideos error catch block ------------------");
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch liked videos",
            error: error,
            errorMsg: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

const removeLike = async (req, res) => {
    try {
        const videoId = req.params.key;
        const userId = req.user?._id;
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: videoId"
            });
        };
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        };
        const video = await VideoModel.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        };
        if (!video.likes.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You have not liked this video"
            });
        };
        video.likes.pull(userId);
        await video.save();
        return res.status(200).json({
            success: true,
            message: "Like removed successfully",
            data: video
        });
    } catch (error) {
        console.log("------------------ removeLike error catch block ------------------");
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove like",
            error: error,
            errorMsg: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

module.exports = { videoUpload, getAllVideos, getVideo, deleteVideo, updateVideoDetails, myVideos, likeVideo, createVideoComments, getVideoComments, deleteVideoComments, getMyLikedVideos, removeLike };