import { Router } from "express";
import { userController } from "../controllers/userController";

const router = Router();

// Registrar novo usuário
router.post("/register", userController.register);
// Login de usuário
router.post("/login", userController.login);
// Listar todos os usuários ativos
router.get("/", userController.getAll);
// Listar todos os usuários (ativos e inativos)
router.get("/all", userController.getAllIncludingInactive);
// get mine atheletes
router.get("/my-atheletes/:userId", userController.getMine);
// Listar todos os usuários inativos
router.get("/inactive", userController.getAllInactive);
// Obter usuário por ID
router.get("/:id", userController.getById);
// Desativar usuário por ID
router.put("/deactivate/:id", userController.deactivate);
// Ativar usuário por ID
router.put("/activate/:id", userController.activate);
// Atualizar informações básicas do usuário
router.put("/update/:id", userController.update);

export default router;
