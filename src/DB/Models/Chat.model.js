import mongoose, { Schema, model, Types } from 'mongoose';

const chatSchema = new Schema(
  {
    senderId: { type: Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Types.ObjectId, ref: 'User', required: true },
    messages: [
      {
        message: { type: String, required: true },
        senderId: { type: Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Chat = mongoose.models.Chat || model('Chat', chatSchema);
