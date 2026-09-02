import { Response } from "express";
import PlantingService from "./plantings.service";
import { PlantingInput} from "./plantings.types";
import asyncHandler from "../../utils/asyncHandler";
import { AuthRequest } from "../../middlewares/authMiddleware";

class PlantingController {
  // LISTAR PLANTAÇÕES
  getAllPlantings = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;

      const plantings = await PlantingService.getAll(user);

      if (!plantings) {
        return res.status(404).json({
          success: false,
          message: "Nenhuma plantação encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        plantings,
      });
    },
  );

  // CRIAR PLANTAÇÃO
  createPlanting = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const plantingData: PlantingInput = req.body;

      const newPlanting = await PlantingService.create(
        user,
        plantingData,
      );

      if (!newPlanting) {
        return res.status(400).json({
          success: false,
          message: "Não foi possível cadastrar a plantação.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Plantação cadastrada com sucesso.",
        newPlanting,
      });
    },
  );

  // ATUALIZAR PLANTAÇÃO
  updatePlanting = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const { id } = req.params;
      const plantingData: PlantingInput = req.body;

      const updatedPlanting =
        await PlantingService.update(
          id,
          user,
          plantingData,
        );

      if (!updatedPlanting) {
        return res.status(404).json({
          success: false,
          message:
            "Plantação não encontrada ou não pôde ser atualizada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Plantação atualizada com sucesso.",
        updatedPlanting,
      });
    },
  );

  // DELETAR PLANTAÇÃO
  deletePlanting = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const { id } = req.params;

      await PlantingService.delete(id, user);

      return res.status(204).json({
        success: true,
        message: "Plantação deletada com sucesso.",
      });
    },
  );

  // BUSCAR PLANTAÇÃO ESPECÍFICA
  getOnePlanting = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = req.user!;
      const { id } = req.params;

      const planting = await PlantingService.getOne(
        id,
        user,
      );

      if (!planting) {
        return res.status(404).json({
          success: false,
          message: "Plantação não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        planting,
      });
    },
  );
}

export default new PlantingController();