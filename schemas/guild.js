const { model, Schema } = require("mongoose");

const createGuild = new Schema({
    guildId: { type: String },
    buttons: { type: Boolean, default: true},
    reconnect: {
        status: { type: Boolean, default: false },
        textChannel: { type: String, default: null },
        voiceChannel: { type: String, default: null }
    },
    
});

module.exports = model("guild", createGuild);