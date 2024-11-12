const { model, Schema } = require("mongoose");

const CreateReconnect = new Schema({
    GuildId: { type: String },
    TextChannelId: { type: String, default: null },
    VoiceChannelId: { type: String, default: null },
});

module.exports = model("Reconnect", CreateReconnect);