import { Schema, model, Types } from 'mongoose';

const NotificationSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String },
  date: { type: Date, default: Date.now },
  target: [{ type: Types.ObjectId, ref: 'User', required: true }], // lista de IDs de usuários que devem receber
  readBy: [{ type: Types.ObjectId, ref: 'User' }] // IDs de usuários que já leram
});

export const Notification = model('Notification', NotificationSchema);
