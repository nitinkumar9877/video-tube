const { createChannelService } = require('../services/channel.services.js');
const channelModel = require('../models/channel.model.js');
const { printCatchBlockError } = require('../utils/errorPrint.utils.js');
const { putProfileImageObjectS3 } = require('../services/imageS3.services.js');
const createChannel = async (req, res) => {
    try {
        console.log("---------------- Channel Controller ----------------");
        if (!req.body) {
            return res.status(400).json({ success: false, error: "Request body is missing" });
        };
        const { channelName, description, category, channelHandle } = req.body;
        console.log("0");
        const channelLogo = req.file;
        if (!channelLogo) {
            return res.status(400).json({ success: false, error: "Channel logo are required" });
        };
        console.log("1");
        const userId = req.user._id; // Assuming you have user authentication and the user ID is available in req.user
        if (!userId) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }
        console.log("2");
        if (!channelName || !description || !category || !channelHandle) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        console.log("3");

        const { profileImageKey, profileImageUrl } = await putProfileImageObjectS3(channelLogo, `channel-logos/${Date.now()}-${channelLogo.originalname}`);

        const channelData = {
            channelName,
            description,
            category,
            channelHandle,
            channelLogo: profileImageUrl || "",
            channelLogoKey: profileImageKey || "",
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

const getMyChannel = async (req, res) => {
    try {
        console.log("---------------- Get My Channel Controller ----------------");

        const channelId = req.user.channel?.[0];
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

module.exports = { createChannel, getMyChannel };