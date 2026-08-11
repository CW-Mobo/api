import { Request, Response, NextFunction } from "express";

// RECEBE UMA FUNÇÃO ASSÍNCRONA E RETORNA UMA FUNÇÃO SÍNCRONA QUE TRATA OS ERROS
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
