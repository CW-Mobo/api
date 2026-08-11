import { Request, Response } from "express";
import dotenv from "dotenv";
import UserService, { UserInput } from "../services/UserService";
import asyncHandler from "../utils/asyncHandler";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

class AuthController {
  // Função auxiliar para configurar o cookie de autenticação
  private setAuthCookie(res: Response, token: string) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
    });
  }

  // LOGIN DE USUÁRIO
  login = asyncHandler(async (req: Request, res: Response) => {
    const { userEmail, userPassword } = req.body;

    // Validação básica de entrada
    if (!userEmail || !userPassword) {
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }

    // Autenticar usuário e gerar token
    const result = await UserService.authenticate({ userEmail, userPassword });
    const token = result.token;

    // Verificar se a autenticação foi bem-sucedida
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message:
          result.message || "Falha na autenticação. Verifique as credenciais.",
      });
    }

    // Web: envia cookie HTTP-only
    if (token) {
      this.setAuthCookie(res, token);
    }

    // Mobile / Web SPA: retorna token no JSON
    return res.status(200).json({
      success: true,
      message: "Login efetuado com sucesso!",
      token,
      user: result.user,
    });
  });

  // REGISTRAR NOVO USUÁRIO
  register = asyncHandler(async (req: Request, res: Response) => {
    const userData: UserInput = {
      ...req.body,
      userImage: req.file?.path || undefined,
    };

    // Validação básica de entrada
    const result = await UserService.create(userData);
    const token = result.token;

    // Verificar se o registro foi bem sucedido
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Não foi possível criar a conta.",
      });
    }

    // Web: envia cookie HTTP-only
    if (token) {
      this.setAuthCookie(res, token);
    }

    // Mobile / Web SPA: retorna token no JSON
    return res.status(200).json({
      success: true,
      message: "Cadastro efetuado com sucesso!",
      token,
      user: result.user,
    });
  });

  // LOGOUT DE USUÁRIO
  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout efetuado com sucesso." });
  });
}

export default new AuthController();
