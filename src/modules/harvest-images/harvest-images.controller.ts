import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import HarvestImageService from "./harvest-images.service";
import asyncHandler from "../../utils/asyncHandler";

class HarvestImageController {
  // BUSCAR IMAGENS DE COLHEITA DO USUÁRIO
  getUserImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const images = await HarvestImageService.getUserImages(user.id);

    if (!images) {
      return res.status(200).json({
        success: true,
        message: "Nenhuma Imagem foi encontrada.",
        images: [],
      });
    }

    return res.status(200).json({
      success: true,
      images,
    });
  });

  // ENVIAR IMAGEM DE PERFIL DO USUÁRIO
  uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo foi enviado.",
      });
    }

    const imageName = req.file.filename;

    const result = await HarvestImageService.uploadImage(user.id, imageName);

    return res.status(201).json({
      success: true,
      message: "Imagem enviada com sucesso!",
      image: result,
    });
  });
}

export default new HarvestImageController();
