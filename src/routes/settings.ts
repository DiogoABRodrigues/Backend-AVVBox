import { Router } from "express";
import { SettingsController } from "../controllers/settingsController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();
const settingsController = new SettingsController();

// Criar settings para um user (autenticado)
router.post("/", authMiddleware, (req, res) =>
  settingsController.create(req, res),
);

// Editar settings de um user
router.put("/:userId", authMiddleware, (req, res) =>
  settingsController.update(req, res),
);

// Buscar settings de um user
router.get("/:userId", authMiddleware, (req, res) =>
  settingsController.getByUser(req, res),
);

export default router;
