import { model, Schema } from 'mongoose';

const clientInfoSchema = new Schema({ 
  _id: { type: String, default: 'global_bot_stats' }, 
  counts: {
    messageCount: { type: Number, default: 0 },
    commandCount: { type: Number, default: 0 },
    trackCount: { type: Number, default: 0 },
    playTime: { type: Number, default: 0 } 
  },
}, { timestamps: true }); 

export default model("client", clientInfoSchema); 