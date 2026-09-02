import { Router } from "express";
import HarvestController from "./harvests.controller";
import {
  authMiddleware,
  ensureUser,
} from "../../middlewares/authMiddleware";
import { validateObjectId } from "../../middlewares/validateObjectId";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use(ensureUser); // Todas as rotas abaixo precisam de usuário autenticado

router.get("/paginated", HarvestController.getPaginatedHarvests);
router.get("/", HarvestController.getAllHarvests);
router.post("/", HarvestController.createHarvest);
router.delete("/", HarvestController.deleteManyHarvests);

router.use("/:id", validateObjectId); // Todas as rotas com ID passam pela validação do ObjectId

router.put("/:id", HarvestController.updateHarvest);
router.get("/:id", HarvestController.getOneHarvest);

export default router;