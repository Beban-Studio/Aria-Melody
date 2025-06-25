import { model, Schema } from 'mongoose'; 

const createGuildSchema = new Schema({ 
    guildId: { type: String, required: true, unique: true, index: true }, 
    isPremium: { type: Boolean, default: false },
    buttons: { type: Boolean, default: true}, 
    reconnect: { 
        status: { type: Boolean, default: false },
        textChannel: { type: String, default: null }, 
        voiceChannel: { type: String, default: null } 
    },
    request: { 
        status: { type: Boolean, default: false },
        textChannel: { type: String, default: null },
        nowPlayingMessageId: { type: String, default: null },
    },
}, { timestamps: true });

export default model("guild", createGuildSchema); 