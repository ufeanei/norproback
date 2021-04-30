import mongoose from "mongoose";

var messageSchema = new mongoose.Schema({
  sender: mongoose.Schema.Types.ObjectId,
  senderName: String,
  senderpic: String,
  mes: String,
  read: Boolean,
  sentAt: Date,
});

var conversationSchema = new mongoose.Schema({
  participants: [mongoose.Schema.Types.ObjectId],
  partNames: [String],
  partpics: [String],
  allMessages: [messageSchema],
  deletedFor: [mongoose.Schema.Types.ObjectId],
  totalMessages: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

var Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
