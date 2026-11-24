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

const suscribeOrUnsubscribeChannel = async (req, res) => {
    try {
        console.log("---------------- Subscribe/Unsubscribe Channel Controller ----------------");
        const userId = req.user?._id;
        const channelId = req.params.channelId;
        console.log("1");
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });
        }
        console.log("2");

        if (!channelId) {
            return res.status(400).json({
                success: false,
                error: "Channel ID is required"
            });
        };
        console.log("3");
        const user = await userModel.findById(userId);
        console.log("User:", user);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        console.log("4");
        const channel = await channelModel.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                error: "Channel not found"
            });
        }
        console.log("5");
        if (channel.owner.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                error: "You cannot subscribe to your own channel",
                isOwner: true

            });
        };
        console.log("6");
        const isSubscribed = user.subscribedChannels.includes(channelId);
        console.log("7");
        if (isSubscribed) {
            user.subscribedChannels.pull(channelId);
            channel.subscribers.pull(userId);
            await user.save();
            await channel.save();

            if (channel.subscribersCount > 0) {
                channel.subscribersCount -= 1;
            }
            return res.status(200).json({
                success: true,
                message: "Unsubscribed from the channel successfully",
                isSubscribed: false,
                isOwner: false
            });
        } else {
            // Subscribe logic
            user.subscribedChannels.push(channelId);
            channel.subscribers.push(userId);
            await user.save();
            await channel.save();

            return res.status(200).json({
                success: true,
                message: "Subscribed to the channel successfully",
                isSubscribed: true,
                isOwner: false
            });
        }
        console.log("----- Subscribe/Unsubscribe Channel Controller executed successfully -----");

    } catch (error) {
        printCatchBlockError(error);

        return res.status(500).json({
            success: false,
            error: error.message || "Unable to subscribe/unsubscribe channel"
        });
    }
};

module.exports = { createChannel, getMyChannel, getSubscribedChannelsByUser, suscribeOrUnsubscribeChannel };