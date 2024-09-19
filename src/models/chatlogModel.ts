import { model, Schema } from "mongoose";
import { IChatLog } from "../interfaces/chatlogInterface";

const chatMessageSchema = new Schema({
  userId: {
    type: String,
    require: true
  },
  message: {
    type: String,
    require: true
  },
  createdAt: {
    type: Date,
    require: true
  }
});

const chatLogSchema = new Schema({
  gameId: {
    type: String,
    required: false
  },
  messages: {
    type: [chatMessageSchema], // EWinConditions
    required: false
  }
});

const ChatLog  = model<IChatLog>('ChatLog', chatLogSchema);

export default ChatLog;