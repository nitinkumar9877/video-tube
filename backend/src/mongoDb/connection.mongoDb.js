const mongoose = require('mongoose');
const configData = require("../config/environment.config.js");
const connectToMongoDB = async () => {
    await mongoose.connect(configData.MONGODBURL);
    console.log("Connected to MongoDB");
};

module.exports = connectToMongoDB;