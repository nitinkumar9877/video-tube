const app = require("./src/app.js");
const configData = require("./src/config/environment.config.js");
const connectToMongoDB = require("./src/mongoDb/connection.mongoDb.js");

connectToMongoDB();

app.listen(configData.PORT, () => {
    console.log("Server is running on port " + configData.PORT);
});