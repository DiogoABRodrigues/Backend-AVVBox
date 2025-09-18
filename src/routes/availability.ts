import { Router } from "express";
import { AvailabilityController } from "../controllers/availabilityController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();
const availabilityController = new AvailabilityController();

// ADMIN ou PT
router.put("/:id", authMiddleware, authorizeRoles("Admin", "PT"), (req, res) => availabilityController.update(req, res));
router.post("/", authMiddleware, authorizeRoles("Admin", "PT"), (req, res) => availabilityController.create(req, res));

// Protegido (só autenticados)
// Buscar disponibilidade de um PT
router.get("/:ptId", authMiddleware, (req, res) => availabilityController.getByPT(req, res));
export default router;
