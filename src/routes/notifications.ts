import { Router } from "express";
import { notificationController } from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

// Criar nova notificação pt ou admin
router.post("/:userId", authMiddleware, authorizeRoles("Admin", "PT"), (req, res) => notificationController.create(req, res));

// Listar todas as notificações (admin)
router.get("/", authMiddleware, authorizeRoles("Admin"), (req, res) => notificationController.getAll(req, res));

// Listar notificações de um user específico
router.get("/:targetId", authMiddleware, (req, res) => notificationController.getByUser(req, res));

// Deletar notificação específica de um user
router.delete("/:notificationId/:userId", authMiddleware, (req, res) => notificationController.deleteForUser(req, res));

// Marcar notificação como lida
router.post("/:notificationId/:userId/read", authMiddleware, (req, res) => notificationController.markAsRead(req, res));

export default router;
