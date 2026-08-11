import { Request, Response } from "express";
import AlertService from "../services/AlertService";
import asyncHandler from "../utils/asyncHandler";

class AlertController {
  // VERIFICAR ALERTAS DOS SENSORES
  checkAlertSensors = asyncHandler(async (req: Request, res: Response) => {
    return await AlertService.checkAlerts();
  });

  // LISTAR SENSORES COM ALERTAS ATIVAS
  sensorsWithAlerts = asyncHandler(async (req: Request, res: Response) => {
    return await AlertService.getSensorsWithAlerts();
  });
}

export default new AlertController();
