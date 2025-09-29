import { Notification } from "../models/Notifications";
import { User } from "../models/User";
import mongoose from "mongoose";
import { userService } from "./userService";
import fetch from "node-fetch";

export const notificationService = {
  async createNotification(
    senderId: string,
    title: string,
    body: string,
    target: string[] | "all" | "my",
  ) {
    const sender = await User.findById(senderId);
    if (!sender) throw new Error("Usuário remetente não encontrado");

    if (
      Array.isArray(target) &&
      target.length === 1 &&
      (target[0] === "my" || target[0] === "all")
    ) {
      target = target[0] as "my" | "all";
    }

    let recipients: string[] = [];

    if (target === "all") {
      // Apenas utilizadores ativos
      const users = await User.find({ active: true });
      recipients = users.map((u) => u._id.toString());
    } else if (target === "my") {
      recipients = sender.atheletes.map((athlete: any) => athlete.toString());
    } else if (Array.isArray(target)) {
      recipients = target;
    } else {
      throw new Error("Target inválido");
    }

    const notification = await Notification.create({
      title,
      body,
      target: recipients,
    });

    for (const recipient of recipients) {
      const user = await User.findById(recipient);
      if (user && typeof user.expoPushToken === "string") {
        try {
          await notificationService.sendExpoPushNotification(
            user.expoPushToken,
            title,
            body,
          );
        } catch (err) {
          console.error("Erro ao enviar push:", err);
        }
      }
    }

    return notification;
  },

  async getAllNotifications() {
    return Notification.find().sort({ date: -1 });
  },

  async getUserNotifications(targetId: string) {
    return Notification.find({ target: { $in: [targetId] } }).sort({
      date: -1,
    });
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
    if (
      !notification.readBy.some(
        (id: any) => id.toString() === userObjectId.toString(),
      )
    ) {
      notification.readBy.push(userObjectId);
      await notification.save();
    }

    return notification;
  },

  async sendExpoPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
  ) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: { withSome: "data" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  },
};
