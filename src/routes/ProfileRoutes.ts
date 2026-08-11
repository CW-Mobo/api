import { Router } from "express";
import ProfileController from "../controllers/ProfileController";
import { authMiddleware, ensureUser } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use(ensureUser); // Todas as rotas abaixo precisam de usuário autenticado

router.get("/", ProfileController.getUserImage);
router.post("/", ProfileController.uploadImage);

export default router;
