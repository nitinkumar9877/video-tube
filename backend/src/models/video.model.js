const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    videoUrl: {
        type: String,
        required: true
    },

    thumbnailUrl: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['Education', 'Entertainment', 'Music', 'Sports', 'News', 'Gaming', 'Lifestyle', 'Other']
    },

    duration: {
        type: Number,
        required: true,
        default: 0
    },

    views: {
        type: Number,
        default: 0
    },

    likes: {
        type: Number,
        default: 0
    },

    dislikes: {
        type: Number,
        default: 0
    },

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    tags: [{
        type: String,
        trim: true
    }],

    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "private"
    },

    publishedAt: {
        type: Date,
        default: Date.now
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    }

}, { timestamps: true });


videoSchema.index({ channel: 1, createdAt: -1 });
videoSchema.index({ visibility: 1, status: 1 });

const VideoModel = mongoose.model("Video", videoSchema);

module.exports = VideoModel;