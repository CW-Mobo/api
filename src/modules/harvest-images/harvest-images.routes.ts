import { Router } from "express";
import HarvestImageController from "./harvest-images.controller";
import { authMiddleware, ensureUser } from "../../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use(ensureUser); // Todas as rotas abaixo precisam de usuário autenticado

router.get("/", HarvestImageController.getUserImages);
router.post("/", HarvestImageController.uploadImage);

export default router;
