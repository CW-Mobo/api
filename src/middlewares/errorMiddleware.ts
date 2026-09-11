import { Request, Response, NextFunction } from "express";

// MIDDLEWARE PARA TRATAR ERROS NÃO CAPTURADOS

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Erro não tratado:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Erro interno do servidor.",
  });
};
