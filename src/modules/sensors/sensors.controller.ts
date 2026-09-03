import { Response } from "express";
import SensorService from "./sensors.service";
import { SensorInput } from "./sensors.types";
import asyncHandler from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/authMiddleware";

class SensorController {
  // LISTAR TODOS OS SENSORES (SEM PAGINAÇÃO)
  getAllSensors = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const sensors = await SensorService.getAll(user);

    if (!sensors) {
      return res.status(404).json({
        success: false,
        message: "Nenhum sensor encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      sensors,
    });
  });

  // CRIAR SENSOR
  createSensor = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const sensorData: SensorInput = req.body;

    const newSensor = await SensorService.create(user, sensorData);

    if (!newSensor) {
      return res.status(400).json({
        success: false,
        message: "Não foi possível cadastrar o sensor.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sensor cadastrado com sucesso.",
      newSensor,
    });
  });

  // ATUALIZAR SENSOR
  updateSensor = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    const sensorData: SensorInput = req.body;

    const updatedSensor = await SensorService.update(id, user, sensorData);

    if (!updatedSensor) {
      return res.status(404).json({
        success: false,
        message: "Sensor não encontrado ou não pôde ser atualizado.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sensor atualizado com sucesso.",
      updatedSensor,
    });
  });

  // DELETAR SENSOR
  deleteSensor = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    await SensorService.delete(id, user);

    return res.status(204).json({
      success: true,
      message: "Sensor deletado com sucesso.",
    });
  });

  // BUSCAR SENSOR ESPECÍFICO
  getOneSensor = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    const sensor = await SensorService.getOne(id, user);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: "Sensor não encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      sensor,
    });
  });
}

export default new SensorController();
