import { Router } from "express";
import { notificationController } from "../controllers/notificationController";

const router = Router();

// Criar nova notificação
router.post("/:userId", notificationController.create);

// Listar todas as notificações (admin)
router.get("/", notificationController.getAll);

// Listar notificações de um user específico
router.get("/:targetId", notificationController.getByUser);

// Deletar notificação específica de um user
router.delete("/:notificationId/:userId", notificationController.deleteForUser);

// Marcar notificação como lida
router.post("/:notificationId/:userId/read", notificationController.markAsRead);

export default router;
