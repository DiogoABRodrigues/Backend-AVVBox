import { Router } from "express";
import { TrainingController } from "../controllers/trainingController";

const router = Router();
const trainingController = new TrainingController();

// Criar treino
router.post("/", (req, res) => trainingController.create(req, res));

// Aceitar treino
router.patch("/:id/accept", (req, res) => trainingController.accept(req, res));

// Rejeitar treino
router.patch("/:id/reject", (req, res) => trainingController.reject(req, res));

// Apagar treino (cancelar)
router.delete("/:id", (req, res) => trainingController.delete(req, res));

export default router;
