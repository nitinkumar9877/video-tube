const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
        // required: true //never use because we are using google auth for login and signup
    },
    profilePictureUrl: {
        type: String,
        default: ""
    },
    channel: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    }]
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;