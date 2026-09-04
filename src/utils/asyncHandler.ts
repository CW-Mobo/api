import { Request, Response, NextFunction } from "express";

// Recebe uma função assíncrona e retorna uma função que trata os erros.
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
