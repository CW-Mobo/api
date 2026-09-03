import { Router } from "express";
import SensorController from "./sensors.controller";
import { authMiddleware, ensureUser } from "../../middlewares/authMiddleware";
import { validateObjectId } from "../../middlewares/validateObjectId";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use(ensureUser); // Todas as rotas abaixo precisam de usuário autenticado

router.get("/", SensorController.getAllSensors);
router.post("/", SensorController.createSensor);

router.use("/:id", validateObjectId); // Todas as rotas com ID passam pela validação do ObjectId

router.put("/:id", SensorController.updateSensor);
router.delete("/:id", SensorController.deleteSensor);
router.get("/:id", SensorController.getOneSensor);

export default router;
