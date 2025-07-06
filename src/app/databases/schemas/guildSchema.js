import mongoose, { Schema } from 'mongoose';

const createGuildSchema = new Schema({ 
  guildId: { type: String, required: true, unique: true, index: true }, 
  prefix: { type: String, default: '!' },
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
  }
}, { timestamps: true });

const GuildModel = mongoose.models.guild || mongoose.model("guild", createGuildSchema);

export default GuildModel;