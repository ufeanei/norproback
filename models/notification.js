import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiverIds: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  type: String,
  url: String,
  personalNote: String,
  comSender: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
