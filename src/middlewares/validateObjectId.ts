import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

// MIDDLEWARE PARA VALIDAR SE O ID FORNECIDO É UM ObjectId VÁLIDO
export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "ID inválido." });
  }
  next();
};
