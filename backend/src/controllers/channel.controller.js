const { createChannelService } = require('../services/channel.services.js');
const channelModel = require('../models/channel.model.js');
const { printCatchBlockError } = require('../utils/errorPrint.utils.js');
const { putProfileImageObjectS3 } = require('../services/imageS3.services.js');
const userModel = require('../models/user.model.js');
const createChannel = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ success: false, error: "Request body is missing" });
        }

        const channelName = req.body.channelName?.trim();
        const description = req.body.description?.trim();
        const category = req.body.category?.trim();
        const channelHandle = req.body.channelHandle?.trim().toLowerCase();
        const channelLogo = req.file;

        if (!channelLogo) {
            return res.status(400).json({ success: false, error: "Channel logo is required" });
        }

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        if (!channelName || !description || !category || !channelHandle) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        if (!/^[a-z0-9-]+$/.test(channelHandle)) {
            return res.status(400).json({
                success: false,
                error: "Channel handle can only contain lowercase letters, numbers and hyphens"
            });
        }

        const { profileImageKey, profileImageUrl } = await putProfileImageObjectS3(
            channelLogo,
            `channel-logos/${Date.now()}-${channelLogo.originalname}`
        );

        if (!profileImageUrl || !profileImageKey) {
            throw new Error("Channel logo upload failed");
        }

        const newChannel = await createChannelService(userId, {
            channelName,
            description,
            category,
            channelHandle,
            channelLogo: profileImageUrl,
            channelLogoKey: profileImageKey
        });

        return res.status(201).json({
            success: true,
            message: "Channel created successfully",
            channel: newChannel
        });
    } catch (error) {
        printCatchBlockError(error);

        if (
            error?.code === 11000 ||
            /already exists|already has a channel/i.test(error.message || "")
        ) {
            return res.status(409).json({
                success: false,
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message || "Unable to create channel"
        });
    }
};

const getMyChannel = async (req, res) => {
    try {
        console.log("---------------- Get My Channel Controller ----------------");

        const channelId = req.user.channels?.[0];
        console.log("1")
        console.log("Channel ID:", channelId);
        if (!channelId) {
            return res.status(200).json({
                success: true,
                data: { channel: null }
            });
        }

        const channel = await channelModel.findOne({
            _id: channelId,
            owner: req.user._id
        });
        console.log("2")
        console.log("Channel:", channel);
        console.log("----- Get My Channel Controller executed successfully -----");
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found"
            });
        };

        return res.status(200).json({
            success: true,
            data: { channel }
        });

    } catch (error) {
        console.log("Error in getMyChannel controller");
        printCatchBlockError(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSubscribedChannelsByUser = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });
        }

        // Step 1: Get user and their subscribed channel IDs
        const user = await userModel.findById(userId)
            .select("subscribedChannels");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const subscribedChannelIds = user.subscribedChannels || [];

        if (subscribedChannelIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No subscribed channels found",
                totalChannels: 0,
                channels: []
            });
        }

        // Step 2: Find all existing channels using subscribed IDs
        const channels = await channelModel.find({
            _id: { $in: subscribedChannelIds }
        });

        // Step 3: Get IDs of existing channels
        const validChannelIds = channels.map(channel =>
            channel._id.toString()
        );

        // Step 4: Identify invalid/deleted channel IDs
        const invalidChannelIds = subscribedChannelIds.filter(
            channelId => !validChannelIds.includes(channelId.toString())
        );

        // Step 5: Remove invalid IDs from user's subscribedChannels
        if (invalidChannelIds.length > 0) {
            await userModel.findByIdAndUpdate(
                userId,
                {
                    $pull: {
                        subscribedChannels: {
                            $in: invalidChannelIds
                        }
                    }
                }
            );
        }

        // Step 6: Return all existing subscribed channels
        return res.status(200).json({
            success: true,
            message: "Subscribed channels fetched successfully",
            totalChannels: channels.length,
            removedInvalidIds: invalidChannelIds.length,
            channels
        });

    } catch (error) {
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            error: error.message || "Unable to fetch subscribed channels"
        });
    }
};

module.exports = { createChannel, getMyChannel, getSubscribedChannelsByUser };  