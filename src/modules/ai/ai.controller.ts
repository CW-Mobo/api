import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import AIService from "./ai.service";

class AIController {
  analyzeImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Envie uma imagem no campo file." });
    }

    const result = await AIService.analyzeImage(req.file);
    return res.status(200).json({ success: true, ...result });
  });

  analyzeFrame = asyncHandler(async (req: Request, res: Response) => {
    const { image_base64, mime_type, file_name } = req.body as {
      image_base64?: string;
      mime_type?: string;
      file_name?: string;
    };

    if (!image_base64 || typeof image_base64 !== "string") {
      return res.status(400).json({ success: false, message: "Envie o quadro em image_base64." });
    }

    const result = await AIService.analyzeFrame({ image_base64, mime_type, file_name });
    return res.status(200).json({ success: true, ...result });
  });
}

export default new AIController();
