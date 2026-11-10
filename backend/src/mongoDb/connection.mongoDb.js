const mongoose = require('mongoose');
const configData = require("../config/environment.config.js");
const connectToMongoDB = async () =>{
    try{
        await mongoose.connect(configData.MONGODBURL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
module.exports =  connectToMongoDB;