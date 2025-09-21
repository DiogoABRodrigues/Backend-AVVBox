import { Router } from "express";
import { ExerciseController } from "../controllers/exerciseController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();
const exerciseController = new ExerciseController();

// ADMIN ou PT podem criar/atualizar
router.post("/", authMiddleware, authorizeRoles("Admin", "PT"), (req, res) =>
  exerciseController.create(req, res),
);

router.post(
  "/weights",
  authMiddleware,
  authorizeRoles("Admin", "PT"),
  (req, res) => exerciseController.createWeights(req, res),
);

router.put("/:id", authMiddleware, authorizeRoles("Admin", "PT"), (req, res) =>
  exerciseController.update(req, res),
);

// PT ou Admin podem apagar exercício
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "PT"),
  (req, res) => exerciseController.delete(req, res),
);

// Todos autenticados podem consultar
router.get("/:athleteId", authMiddleware, (req, res) =>
  exerciseController.getByAthlete(req, res),
);

export default router;
