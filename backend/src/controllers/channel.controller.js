const { createChannelService } = require('../services/channel.services.js');
const createChannel = async (req, res) => {
    try {
        const { name, description, category, channelHandle, channelLogo, channelBanner } = req.body;
        const userId = req.user._id; // Assuming you have user authentication and the user ID is available in req.user
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!name || !description || !category || !channelHandle) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const channelData = {
            name,
            description,
            category,
            channelHandle,
            channelLogo: channelLogo || "",
            channelBanner: channelBanner || ""
        };

        const newChannel = await createChannelService(userId, channelData);

        res.status(201).json({
            success: true,
            message: "Channel created successfully",
            channel: newChannel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { createChannel };