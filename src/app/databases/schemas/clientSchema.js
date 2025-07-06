import mongoose, { Schema } from 'mongoose';

const clientInfoSchema = new Schema({ 
  _id: { type: String, default: 'global_bot_stats' }, 
  counts: {
    commandCount: { type: Number, default: 0 },
    trackCount: { type: Number, default: 0 },
    playTime: { type: Number, default: 0 } 
  },
}, { timestamps: true }); 

const ClientModel = mongoose.models.client || mongoose.model("client", clientInfoSchema);

export default ClientModel;