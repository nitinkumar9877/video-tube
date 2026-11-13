const crypto = require("crypto");
const saltHashConverter = async (token) => {
    const saltRounds = 10; // You can adjust the number of salt rounds as needed
    const hashed = await bcrypt.hash(token, saltRounds);
    return hashed;
};

const sha256hashConverter = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

module.exports = {saltHashConverter, sha256hashConverter};