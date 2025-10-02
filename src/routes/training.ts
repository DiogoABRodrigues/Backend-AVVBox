import { Router } from "express";
import { TrainingController } from "../controllers/trainingController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();
const trainingController = new TrainingController();

// getByPT (autenticado)
router.get("/pt/:ptId", authMiddleware, (req, res) =>
  trainingController.getByPT(req, res),
);

// Criar treino
router.post("/", authMiddleware, (req, res) =>
  trainingController.create(req, res),
);

router.patch("/:id/accept", authMiddleware, (req, res) =>
  trainingController.accept(req, res),
);

// Rejeitar treino
router.patch("/:id/reject", authMiddleware, (req, res) =>
  trainingController.reject(req, res),
);

// Cancelar treino
router.patch("/:id/cancel", authMiddleware, (req, res) =>
  trainingController.cancel(req, res),
);

// Apagar treino (cancelar)
router.delete("/:id", authMiddleware, (req, res) =>
  trainingController.delete(req, res),
);

///upcoming/
router.get("/upcoming/:userId", authMiddleware, (req, res) =>
  trainingController.getUpcoming(req, res),
);

// Próximos 15 dias
router.get("/next15days/:userId", authMiddleware, (req, res) =>
  trainingController.getUpcomingFifteenDays(req, res),
);

router.get("/confirmed/:userId", authMiddleware, (req, res) =>
  trainingController.getAllConfirmed(req, res),
);

// pending/
router.get("/pending/:userId", authMiddleware, (req, res) =>
  trainingController.getPending(req, res),
);

router.put("/:id", authMiddleware, (req, res) =>
  trainingController.update(req, res),
);

export default router;
