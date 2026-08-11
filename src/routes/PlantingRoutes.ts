import { Router } from "express";
import PlantingController from "../controllers/PlantingController";
import { authMiddleware, ensureUser } from "../middlewares/authMiddleware";
import { validateObjectId } from "../middlewares/validateObjectId";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use(ensureUser); // Todas as rotas abaixo precisam de usuário autenticado

router.get("/", PlantingController.getAllPlantings);
router.post("/", PlantingController.createPlanting);

router.use("/:id", validateObjectId); // Todas as rotas com ID passam pela validação do ObjectId

router.put("/:id", PlantingController.updatePlanting);
router.delete("/:id", PlantingController.deletePlanting);
router.get("/:id", PlantingController.getOnePlanting);

export default router;
