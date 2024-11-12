// models/message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  message: { type: String, required: true },
  user: {
    _id: String,
    name: String,
    profileImage: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", MessageSchema);
