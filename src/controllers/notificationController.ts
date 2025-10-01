import { Request, Response } from "express";
import { notificationService } from "../services/notificationService";
import { io } from "../../server";

export const notificationController = {
  async create(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { title, body, target } = req.body;

      if (!title || !target) {
        return res.status(400).json({
          message: "Campos obrigatórios (título e remetente) não preenchidos.",
        });
      }
      // Cria notificações usando o service
      const notification = await notificationService.createNotification(
        userId,
        title,
        body,
        target,
      );
      const targetIds = (notification.target || []).map((id: any) =>
        id.toString(),
      );

      socketFunction(targetIds, notification);

      res.status(201).json({ message: "Notificações criadas", notification });
    } catch (err: any) {
      res.status(500).json({
        message: err.message || "Erro ao criar notificações",
        error: err,
      });
    }
  },

  async getAll(_req: Request, res: Response) {
    try {
      const notifications = await notificationService.getAllNotifications();
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({
        message: err.message || "Erro ao listar notificações",
        error: err,
      });
    }
  },

  async getByUser(req: Request, res: Response) {
    try {
      const { targetId } = req.params;
      const notifications =
        await notificationService.getUserNotifications(targetId);
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({
        message: err.message || "Erro ao listar notificações do user",
        error: err,
      });
    }
  },

  async deleteForUser(req: Request, res: Response) {
    try {
      const { notificationId, userId } = req.params;
      const notification = await notificationService.deleteNotificationForUser(
        notificationId,
        userId,
      );
      res.json({ message: "Notificação removida do usuário", notification });
    } catch (err: any) {
      res.status(500).json({
        message: err.message || "Erro ao atualizar notificação",
        error: err,
      });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId, userId } = req.params;
      const notification = await notificationService.markAsRead(
        notificationId,
        userId,
      );
      res.json({ message: "Notificação marcada como lida", notification });
    } catch (err: any) {
      res.status(500).json({
        message: err.message || "Erro ao marcar notificação como lida",
        error: err,
      });
    }
  },
};

export const socketFunction = (targetIds: string[], notification: any) => {
  targetIds.forEach((tId: string) => {
    const userNotifications = notification.target?.toString().includes(tId)
      ? [notification]
      : [];

    io.to(tId).emit("new-notification", userNotifications);
    console.log(`Enviando notificação para user ${tId}:`, userNotifications);
  });
};
