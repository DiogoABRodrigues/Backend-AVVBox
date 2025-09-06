import { Router } from "express";
import { measuresController } from "../controllers/measuresController";

const router = Router();

// criar medida
router.post("/", measuresController.create);

//get all
router.get("/:userId", measuresController.getByUser);

// buscar medidas de um user
router.get("/atual-measures/:userId", measuresController.getAtualByUser);

// buscar medida de objetivo de um user
router.get("/goal/:userId", measuresController.getGoalByUser);

// buscar medidas atualizadas de um user
router.get("/last-measures/:userId", measuresController.getLastByUser);

// editar medida
router.put("/:id", measuresController.update);

export default router;
