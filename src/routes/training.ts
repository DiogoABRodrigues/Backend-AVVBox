import { Router } from "express";
import { TrainingController } from "../controllers/trainingController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();
const trainingController = new TrainingController();

// getByPT (autenticado)
router.get("/pt/:ptId", authMiddleware, (req, res) => trainingController.getByPT(req, res));

// Criar treino
router.post("/", authMiddleware, (req, res) => trainingController.create(req, res));

router.patch("/:id/accept", authMiddleware, (req, res) => trainingController.accept(req, res));

// Rejeitar treino
router.patch("/:id/reject", authMiddleware, (req, res) => trainingController.reject(req, res));

// Apagar treino (cancelar)
router.delete("/:id", authMiddleware, (req, res) => trainingController.delete(req, res));

///upcoming/
router.get("/upcoming/:userId", authMiddleware, (req, res) => trainingController.getUpcoming(req, res));

// pending/
router.get("/pending/:userId", authMiddleware, (req, res) => trainingController.getPending(req, res));

export default router;
