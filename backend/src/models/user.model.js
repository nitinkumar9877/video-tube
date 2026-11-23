const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },

    password: {
        type: String
        // required: true
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },

    profilePictureUrl: {
        type: String,
        default: ""
    },

    // All channels subscribed to by this user
    subscribedChannels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    }],

    // Channels created/owned by this user
    channels: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel'
        }],
        default: []
    }

}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
