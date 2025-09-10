import { Notification } from "../models/Notifications";
import { User } from "../models/User";
import mongoose from "mongoose";

export const notificationService = {
  async createNotification(senderId: string, title: string, body: string, target: string[] | "all" | "my") {
    const sender = await User.findById(senderId);
    if (!sender) throw new Error("Usuário remetente não encontrado");

    let recipients: string[] = [];

    if (target === "all") {
      const users = await User.find({});
      recipients = users.map(u => u._id.toString());
    } else if (target === "my") {
      recipients = Array.isArray(sender.atheletes) ? sender.atheletes.map((a: any) => a.toString()) : [];
    } else if (Array.isArray(target)) {
      recipients = target;
    } else {
      throw new Error("Target inválido");
    }

    const notifications = await Notification.insertMany(
      recipients.map(r => ({
        user: r,
        title,
        body,
        target,
      }))
    );

    return notifications;
  },

  async getAllNotifications() {
    return Notification.find().sort({ date: -1 });
  },

  async getUserNotifications(targetId: string) {
    return Notification.find({ target: { $in: [targetId] } }).sort({ date: -1 });
  },

  async deleteNotificationForUser(notificationId: string, userId: string) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error("Notification não encontrada");

    notification.target.pull(userId);
    await notification.save();
    return notification;
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error("Notification não encontrada");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!notification.readBy.some((id: any) => id.toString() === userObjectId.toString())) {
      notification.readBy.push(userObjectId);
      await notification.save();
    }

    return notification;
  }
};
