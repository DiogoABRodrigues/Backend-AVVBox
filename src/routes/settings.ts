import { Router } from "express";
import { SettingsController } from "../controllers/settingsController";

const router = Router();
const settingsController = new SettingsController();

// Criar settings para um user
router.post("/", (req, res) => settingsController.create(req, res));

// Editar settings de um user
router.put("/:userId", (req, res) => settingsController.update(req, res));

// Buscar settings de um user
router.get("/:userId", (req, res) => settingsController.getByUser(req, res));

export default router;
