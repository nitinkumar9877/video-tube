const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
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

        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        }
    },
    {
        timestamps: true
    }
);

commentSchema.index({ video: 1, createdAt: -1, _id: -1 });

const CommentModel = mongoose.model("Comment", commentSchema);
module.exports = CommentModel;