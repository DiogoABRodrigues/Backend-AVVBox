import { Schema, model, Types } from "mongoose";

const NotificationSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String },
  date: { type: Date, default: Date.now },
  target: [{ type: Types.ObjectId, ref: "User", required: true, index: true }], // lista de IDs de usuários que devem receber
  readBy: [{ type: Types.ObjectId, ref: "User", index: true }], // IDs de usuários que já leram
});

export const Notification = model("Notification", NotificationSchema);
