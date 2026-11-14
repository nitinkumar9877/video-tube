const { createChannelService } = require('../services/channel.services.js');
const { printCatchBlockError } = require('../utils/errorPrint.utils.js');
const createChannel = async (req, res) => {
    try {
        console.log("---------------- Channel Controller ----------------");
        const { channelName, description, category, channelHandle, channelLogo, channelBanner } = req.body;
        console.log("1");
        const userId = req.user._id; // Assuming you have user authentication and the user ID is available in req.user
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log("2");
        if (!channelName || !description || !category || !channelHandle) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        console.log("3");

        const channelData = {
            channelName,
            description,
            category,
            channelHandle,
            channelLogo: channelLogo || "",
            channelBanner: channelBanner || ""
        };
        console.log("4");

        const newChannel = await createChannelService(userId, channelData);
        console.log("5");
        console.log("----- Channel created successfully-----");
        res.status(201).json({
            success: true,
            message: "Channel created successfully",
            channel: newChannel
        });
    } catch (error) {
        printCatchBlockError(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { createChannel };