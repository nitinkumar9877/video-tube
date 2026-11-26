const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    }
}, { timestamps: true });

tokenSchema.index({ userId: 1, refreshToken: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenModel = mongoose.model("Token", tokenSchema);
module.exports = TokenModel;