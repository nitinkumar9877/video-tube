const channelModel = require("../models/channel.model");
const userModel = require("../models/user.model");

const createChannelService = async (userid, channelData) => {
    try {
        const { name, description, category } = channelData;
        const channelHandle = channelData.channelHandle || name.toLowerCase().replace(/\s+/g, '-');
        const user = await userModel.findById(userid);
        if (!user) {
            throw new Error("User not found");
        }
        const existingChannel = await channelModel.findOne({ channelHandle: channelHandle.toLowerCase() });
        if (existingChannel) {
            throw new Error("Channel name already exists");
        }
        const channel = new channelModel({
            channelHandle,
            name,
            description,
            category,
            owner: user._id,
            channelLogo: channelData.channelLogo || "",
            channelBanner: channelData.channelBanner || ""
        });

        await channel.save();

        // Add the channel to the user's channels array
        user.channel.push(channel._id);
        await user.save();

        return channel;
    } catch (error) {
        throw new Error(`Error creating channel: ${error.message}`);
    }
}

module.exports = {
    createChannelService
};