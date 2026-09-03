import { Router } from "express";
import SensorDataController from "./sensor-data.controller";
import { authMiddleware, ensureUser } from "../../middlewares/authMiddleware";
import { validateObjectId } from "../../middlewares/validateObjectId";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use(ensureUser); // Todas as rotas abaixo precisam de usuário autenticado

router.get("/", SensorDataController.getAllSensorDatas);
router.post("/", SensorDataController.createSensorData);

router.use("/:id", validateObjectId); // Todas as rotas com ID passam pela validação do ObjectId

router.put("/:id", SensorDataController.updateSensorData);
router.delete("/:id", SensorDataController.deleteSensorData);
router.get("/:id", SensorDataController.getOneSensorData);

export default router;
