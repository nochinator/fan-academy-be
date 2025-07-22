import { model, Schema } from "mongoose";
import { IChatLog } from "../interfaces/chatlogInterface";

const chatMessageSchema = new Schema({
  username: {
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
  messages: {
    type: [chatMessageSchema],
    default: [],
    id: false
  }
});

const ChatLog  = model<IChatLog>('ChatLog', chatLogSchema);

export default ChatLog;