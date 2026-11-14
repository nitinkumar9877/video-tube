
const channelModel = require("../models/channel.model");
const userModel = require("../models/user.model");

const createChannelService = async (userId, channelData) => {
    try {
        // 1. Validate channel data
        const {
            channelName,
            description,
            category,
            channelLogo,
            channelBanner
        } = channelData;

        // 2. Validate channel name
        if (
            typeof channelName !== "string" ||
            !channelName.trim()
        ) {
            throw new Error("Channel name is required.");
        }

        const normalizedChannelName = channelName.trim();

        // 3. Generate and normalize channel handle
        const channelHandle = (
            channelData.channelHandle ||
            normalizedChannelName.toLowerCase().replace(/\s+/g, "-")
        ).trim().toLowerCase();

        if (!/^[a-z0-9-]+$/.test(channelHandle)) {
            throw new Error(
                "Channel handle can only contain lowercase letters, numbers and hyphens."
            );
        }

        // 4. Find user
        const user = await userModel.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        // 5. Check whether channel handle already exists
        const existingChannel = await channelModel.findOne({
            channelHandle
        });

        if (existingChannel) {
            throw new Error("Channel handle already exists.");
        }

        // 6. Create channel
        const channel = new channelModel({
            channelName: normalizedChannelName,
            channelHandle,
            description,
            category,
            owner: user._id,
            channelLogo: channelLogo || "",
            channelBanner: channelBanner || ""
        });

        // 7. Save channel
        await channel.save();

        // 8. Add channel ID to user's channel array
        user.channel.push(channel._id);

        await user.save();

        // 9. Return created channel
        return channel;

    } catch (error) {
        console.error("Create channel service error:", error);

        // Preserve original error instead of wrapping it repeatedly
        throw error;
    }
};

module.exports = {
    createChannelService
};
