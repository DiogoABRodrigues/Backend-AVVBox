import { Schema, model, Types } from 'mongoose';

const NotificationsSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  body: String,
  title: String,
  target: String,
});

export const Notification = model('Notification', NotificationsSchema);
