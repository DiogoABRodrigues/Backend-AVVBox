import { Router } from "express";
import { TrainingController } from "../controllers/trainingController";

const router = Router();
const trainingController = new TrainingController();

// getByPT
router.get("/pt/:ptId", (req, res) => trainingController.getByPT(req, res));

// Criar treino
router.post("/", (req, res) => trainingController.create(req, res));

router.patch("/:id/accept", (req, res) => trainingController.accept(req, res));

// Rejeitar treino
router.patch("/:id/reject", (req, res) => trainingController.reject(req, res));

// Apagar treino (cancelar)
router.delete("/:id", (req, res) => trainingController.delete(req, res));

///upcoming/
router.get("/upcoming/:userId", (req, res) => trainingController.getUpcoming(req, res));

// pending/
router.get("/pending/:userId", (req, res) => trainingController.getPending(req, res));

export default router;
