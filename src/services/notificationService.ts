import { Notification } from "../models/Notifications";
import { User } from "../models/User";
import mongoose from "mongoose";
import fetch from "node-fetch";
import pLimit from "p-limit";

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
    const users = await User.find({ active: true }).select("_id");
    recipients = users.map((u) => u._id.toString());
  } else if (target === "my") {
    recipients = (sender.atheletes || []).map((athlete: any) =>
      athlete.toString()
    );
  } else if (Array.isArray(target)) {
    recipients = target;
  } else {
    throw new Error("Target inválido");
  }

  const notification = await Notification.create({
    title,
    body,
    sender: new mongoose.Types.ObjectId(senderId),
    target: recipients.map((id) => new mongoose.Types.ObjectId(id)),
  });

  const limit = pLimit(5);

  // Envia notificações individuais ou push
  await Promise.all(
    recipients.map((recipient) =>
      limit(async () => {
        try {
          // Aqui você pode criar sub-notificação na BD se quiser
          // await NotificationSub.create({ notification: notification._id, user: recipient });

          // Envia push
          const res = await fetch(
            `https://app.nativenotify.com/api/indie/notification`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subID: recipient,
                appId: 32298,
                appToken: "FJv06dvuLO2xdBkaBSxXog",
                // 🔥 MUDANÇA CRUCIAL: Usar "data" em vez de "title/message"
                data: {
                  title: title,
                  message: body,
                  message_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID único
                  timestamp: new Date().toISOString(),
                  // Adicione qualquer dado extra que precisar
                  type: "chat_message",
                  sender_id: recipient // ou qualquer ID do remetente
                }
              }),
            }
          );
          if (!res.ok) {
            console.error(
              `Falha ao enviar push para ${recipient}:`,
              await res.text()
            );
          }
        } catch (err) {
          console.error(`Erro ao enviar push para ${recipient}:`, err);
        }
      })
    )
  );

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
    await Notification.updateOne(
      { _id: notificationId },
      { $pull: { target: userId } }
    );
    return;
  },

  async markAsRead(notificationId: string, userId: string) {
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } }, // adiciona só se não existir
      { new: true } // retorna o documento atualizado
    );

    if (!updatedNotification) throw new Error("Notification não encontrada");

    return updatedNotification;
  },

};
