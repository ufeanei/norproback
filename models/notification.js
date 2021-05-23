import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiverIds: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  type: String,
  personalNote: String,
  sender: {
    name: String,
    picture: String,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
