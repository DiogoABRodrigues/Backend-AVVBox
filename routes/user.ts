import { Router } from "express";
import { userController } from "../controllers/userController";

const router = Router();

// Registrar novo usuário
router.post("/register", userController.register);
// Login de usuário
router.post("/login", userController.login);
// Listar todos os usuários (admin)
router.get("/", userController.getAll);
// Obter usuário por ID
router.get("/:id", userController.getById);

export default router;
