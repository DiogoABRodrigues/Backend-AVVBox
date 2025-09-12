import { Router } from "express";
import { AvailabilityController } from "../controllers/availabilityController";

const router = Router();
const availabilityController = new AvailabilityController();

// Criar disponibilidade
router.post("/", (req, res) => availabilityController.create(req, res));

// Editar disponibilidade
router.put("/:id", (req, res) => availabilityController.update(req, res));

// Buscar disponibilidade de um PT
router.get("/:ptId", (req, res) => availabilityController.getByPT(req, res));

export default router;
