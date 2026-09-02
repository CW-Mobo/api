import { Response } from "express";
import SensorDataService from "./sensor-data.service";
import { SensorDataInput } from "./sensor-data.types";
import asyncHandler from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/authMiddleware";

class SensorDataController {
  // LISTAR TODOS OS DADOS DE SENSOR (SEM PAGINAÇÃO)
  getAllSensorDatas = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;

      const sensorDatas =
        await SensorDataService.getAll(user);

      if (!sensorDatas) {
        return res.status(404).json({
          success: false,
          message: "Nenhum Dado de Sensor encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        sensorDatas,
      });
    },
  );

  // CRIAR DADO DE SENSOR
  createSensorData = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;

      const sensorDataD: SensorDataInput = req.body;

      const newSensorData =
        await SensorDataService.create(
          user,
          sensorDataD,
        );

      if (!newSensorData) {
        return res.status(400).json({
          success: false,
          message:
            "Não foi possível cadastrar o Dado do Sensor.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Dado de Sensor cadastrado com sucesso.",
        newSensorData,
      });
    },
  );

  // ATUALIZAR DADO DE SENSOR
  updateSensorData = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const { id } = req.params;

      const sensorDataD: SensorDataInput = req.body;

      const updatedSensorData =
        await SensorDataService.update(
          id,
          user,
          sensorDataD,
        );

      if (!updatedSensorData) {
        return res.status(404).json({
          success: false,
          message:
            "Dado de Sensor não encontrado ou não pôde ser atualizado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Dado de Sensor atualizado com sucesso.",
        updatedSensorData,
      });
    },
  );

  // DELETAR DADO DE SENSOR
  deleteSensorData = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const { id } = req.params;

      await SensorDataService.delete(id, user);

      return res.status(204).json({
        success: true,
        message: "Dado de Sensor deletado com sucesso.",
      });
    },
  );

  // BUSCAR UM DADO DE SENSOR ESPECÍFICO
  getOneSensorData = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const { id } = req.params;

      const sensorData =
        await SensorDataService.getOne(id, user);

      if (!sensorData) {
        return res.status(404).json({
          success: false,
          message: "Dado de Sensor não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        sensorData,
      });
    },
  );
}

export default new SensorDataController();