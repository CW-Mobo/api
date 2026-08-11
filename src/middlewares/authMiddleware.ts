import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

// MIDDLEWARE PARA VERIFICAR O TOKEN JWT
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // 1️⃣ Tenta pegar o token do cookie
  let token = req.cookies?.token;

  // 2️⃣ Se não tiver, tenta pegar do header Authorization
  if (!token && req.headers.authorization?.split(" ")[1]) {
    token = req.headers.authorization?.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token não fornecido." });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não definido");
    const payload = jwt.verify(token, secret) as IUserPayload;
    console.log(payload);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Não autorizado." });
  }
};

// MIDDLEWARE PARA GARANTIR QUE O USUÁRIO ESTÁ AUTENTICADO ANTES DE ACESSAR CERTAS ROTAS
export const ensureUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Token inválido." });
  }
  next();
};
