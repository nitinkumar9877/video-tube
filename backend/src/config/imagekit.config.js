const ImageKit = require("imagekit");
const configData = require("./environment.config");
// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: configData.IMAGEKIT_PUBLIC_KEY,
    privateKey: configData.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: configData.IMAGEKIT_URL_ENDPOINT_URL
});

module.exports = imagekit;