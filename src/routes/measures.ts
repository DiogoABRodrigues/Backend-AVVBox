import { Router } from "express";
import { measuresController } from "../controllers/measuresController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

// Admin ou PT
router.post("/", authMiddleware, authorizeRoles("Admin", "PT"), (req, res) =>
  measuresController.create(req, res),
);

//get all
router.get("/:userId", authMiddleware, (req, res) =>
  measuresController.getByUser(req, res),
);

// buscar medidas de um user
router.get("/atual-measures/:userId", authMiddleware, (req, res) =>
  measuresController.getAtualByUser(req, res),
);

// buscar medida de objetivo de um user
router.get("/goal/:userId", authMiddleware, (req, res) =>
  measuresController.getGoalByUser(req, res),
);

// buscar medidas atualizadas de um user
router.get("/last-measures/:userId", authMiddleware, (req, res) =>
  measuresController.getLastByUser(req, res),
);

// editar medida
router.put("/:id", authMiddleware, (req, res) =>
  measuresController.update(req, res),
);

// deletar medida mais recente e com menos de 30 dias
router.delete("/:id", authMiddleware, (req, res) =>
  measuresController.deleteMeasure(req, res),
);

export default router;
