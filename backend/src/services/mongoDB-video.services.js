const VideoModel = require("../models/video.model.js");
const userModel = require("../models/user.model.js");
const channelModel = require("../models/channel.model.js");

// import services for S3 operations
const { deleteVideoObjectS3 } = require("./videosS3.services.js");
const { deleteThumbnailObjectS3 } = require("./imageS3.services.js");

const uploadVideoDataToMongoDB = async (userId, payLoadData) => {
    const user = await userModel.findById(userId).select("_id channel");

    if (!user) {
        throw new Error("User not found");
    }

    const channelId = payLoadData.channelId || user.channel?.[0];

    if (!channelId) {
        throw new Error("Create a channel before uploading a video");
    }

    const channel = await channelModel.findOne({
        _id: channelId,
        owner: user._id
    }).select("_id");

    if (!channel) {
        throw new Error("Channel not found or does not belong to the user");
    }

    const { channelId: ignoredChannelId, ...videoData } = payLoadData;

    const video = new VideoModel({
        ...videoData,
        owner: user._id,
        channel: channel._id
    });

    // Save video first
    const savedVideo = await video.save();

    // Increment total video count
    await channelModel.findByIdAndUpdate(
        channel._id,
        {
            $inc: { totalVideos: 1 }
        }
    );

    return savedVideo;
};

const deleteVideoFromEverywhere = async (objID) => {
    const video = await VideoModel.findById(objID);

    if (!video) {
        throw new Error("Video not found");
    }

    const channel = await channelModel.findById(video.channel);

    if (!channel) {
        throw new Error("Channel not found");
    }

    // Verify channel ownership
    if (video.channel.toString() !== channel._id.toString()) {
        throw new Error("Video does not belong to the specified channel");
    }

    if (
        !video.videoKey?.trim() ||
        !video.thumbnailKey?.trim()
    ) {
        throw new Error("Video or thumbnail key is missing");
    }
    console.log("Video Key  :: ", video.videoKey);
    console.log("Thumbnail Key  :: ", video.thumbnailKey);
    // Step 1: Delete video from S3
    // await deleteVideoObjectS3(video.videoKey);

    // Step 2: Delete thumbnail from S3
    await deleteThumbnailObjectS3(video.thumbnailKey);

    // Step 3: Delete video from MongoDB
    const response = await VideoModel.findByIdAndDelete(objID);

    // Step 4: Update channel video count
    await channelModel.findByIdAndUpdate(
        video.channel,
        {
            $inc: { totalVideos: -1 }
        }
    );

    return response;
};

const updateVideoDetailsInMongoDB = async (videoId, updateData) => {
    console.log("11")
    const video = await VideoModel.findById(videoId);
    console.log("22")

    if (!video) {
        throw new Error("Video not found");
    }
    console.log("33")

    //check if the video belongs to the channel of the user
    const channel = await channelModel.findById(video.channel);

    if (!channel) {
        throw new Error("Channel not found");
    }
    console.log("44")

    // Verify channel ownership
    if (video.channel.toString() !== channel._id.toString()) {
        throw new Error("Video does not belong to the specified channel");
    }
    console.log("55")

    // Validate updateData fields
    const allowedFields = ["title", "description", "tags", "visibility"];

    const isValidUpdate = Object.keys(updateData).every((key) =>
        allowedFields.includes(key)
    );
    console.log("66")

    if (!isValidUpdate) {
        throw new Error("Invalid fields in update data");
    }
    console.log("77")

    // Update the video details
    Object.keys(updateData).forEach((key) => {
        video[key] = updateData[key];
    });
    console.log("88")

    const updatedVideo = await video.save();
    console.log("99")

    return updatedVideo;
};

const likeVideoInMongoDB = async (userId, videoId) => {
    const video = await VideoModel.findById(videoId);
    if (!video) {
        throw new Error("Video not found");
    }

    // Ensure likes is an array
    if (!Array.isArray(video.likes)) {
        video.likes = [];
    }

    // Check whether user already liked this video
    const hasLiked = video.likes.some(
        (id) => id.toString() === userId.toString()
    );

    if (hasLiked) {
        // Remove like
        video.likes.pull(userId);
    } else {
        // Add like
        video.likes.push(userId);
    }

    await video.save();

    return {
        videoId: video._id,
        likes: video.likes,
        likesCount: video.likes.length,
        isLiked: !hasLiked
    };
};

module.exports = { uploadVideoDataToMongoDB, deleteVideoFromEverywhere, updateVideoDetailsInMongoDB, likeVideoInMongoDB };