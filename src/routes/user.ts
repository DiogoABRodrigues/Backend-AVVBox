import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

// Endpoint Wake-Up (Render free instance)
router.get("/wake-up", (req, res) => {
  res.send("Backend acordado!");
});

// Público
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/verify", userController.verify);
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password-with-code", userController.resetPasswordWithCode);
router.post("/resend-verification", userController.resendVerificationEmail);

// Protegido (só admins)
router.get(
  "/all",
  authMiddleware,
  authorizeRoles("Admin", "PT"),
  userController.getAllIncludingInactive,
);
router.get(
  "/inactive",
  authMiddleware,
  authorizeRoles("Admin"),
  userController.getAllInactive,
);
router.put(
  "/deactivate/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  userController.deactivate,
);
router.put(
  "/activate/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  userController.activate,
);

// Protegido (só autenticados)
router.get(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "PT"),
  userController.getAll,
);
router.get(
  "/my-atheletes/:userId",
  authMiddleware,
  authorizeRoles("Admin", "PT"),
  userController.getMine,
);
router.get("/get-staff", authMiddleware, (req, res) =>
  userController.getStaff(req, res),
);
router.get("/:id", authMiddleware, userController.getById);

// Protegido (qualquer user autenticado pode atualizar o próprio perfil)
router.put("/update/:id", authMiddleware, userController.update);

router.post(
  "/save-expo-token/:userId",
  authMiddleware,
  userController.saveExpoPushToken,
);

export default router;
