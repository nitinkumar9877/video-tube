
const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
    {
        channelName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100
        },
        channelHandle: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9._-]+$/
        },

        description: {
            type: String,
            default: "",
            maxlength: 1000
        },

        channelLogo: {
            type: String,
            default: ""
        },

        channelBanner: {
            type: String,
            default: ""
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        subscribersCount: {
            type: Number,
            default: 0,
            min: 0
        },

        totalVideos: {
            type: Number,
            default: 0,
            min: 0
        },

        totalViews: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const channelModel = mongoose.model('Channel', channelSchema);

module.exports = channelModel;
