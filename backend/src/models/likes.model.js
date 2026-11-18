const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    likedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// One user can like a video only once
likeSchema.index(
    { user: 1, video: 1 },
    { unique: true }
);

const LikeModel = mongoose.model("Like", likeSchema);