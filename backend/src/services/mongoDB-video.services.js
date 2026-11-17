const VideoModel = require("../models/video.model.js");
const userModel = require("../models/user.model.js");
const channelModel = require("../models/channel.model.js");

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

module.exports = { uploadVideoDataToMongoDB };