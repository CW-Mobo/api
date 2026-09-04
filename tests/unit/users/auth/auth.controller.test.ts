import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import AuthController from "../../../../src/modules/users/auth/auth.controller";
import AuthService from "../../../../src/modules/users/auth/auth.service";

const mockResponse = () => {
  const res = {} as Response;

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);

  return res;
};

const mockNext = () => vi.fn() as NextFunction;

describe("AuthController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthService, "authenticate");
    vi.spyOn(AuthService, "create");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    it("deve retornar 400 quando e-mail não for informado", async () => {
      const req = {
        body: {
          userPassword: "123456",
        },
      } as any;

      const res = mockResponse();

      await AuthController.login(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });

      expect(AuthService.authenticate).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando senha não for informada", async () => {
      const req = {
        body: {
          userEmail: "joao@email.com",
        },
      } as any;

      const res = mockResponse();

      await AuthController.login(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    });

    it("deve realizar login com sucesso", async () => {
      const req = {
        body: {
          userEmail: "joao@email.com",
          userPassword: "123456",
        },
      } as any;

      const res = mockResponse();

      const result = {
        success: true,
        message: "Login efetuado com sucesso!",
        token: "mock-token",
        user: {
          id: "user-1",
          userName: "João",
          userEmail: "joao@email.com",
          userRole: "company_worker",
          company: "company-1",
        },
      };

      const authenticate = vi
        .spyOn(AuthService, "authenticate")
        .mockResolvedValue(result);

      await AuthController.login(req, res, mockNext());

      expect(authenticate).toHaveBeenCalledWith({
        userEmail: "joao@email.com",
        userPassword: "123456",
      });

      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "mock-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24,
          path: "/",
        }),
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login efetuado com sucesso!",
        token: "mock-token",
        user: result.user,
      });
    });

    it("deve retornar 401 quando a autenticação falhar", async () => {
      const req = {
        body: {
          userEmail: "joao@email.com",
          userPassword: "senha-errada",
        },
      } as any;

      const res = mockResponse();

      vi.spyOn(AuthService, "authenticate").mockResolvedValue({
        success: false,
        message: "Senha incorreta.",
      });

      await AuthController.login(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Senha incorreta.",
      });

      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("deve usar mensagem padrão quando a autenticação falhar sem mensagem", async () => {
      const req = {
        body: {
          userEmail: "joao@email.com",
          userPassword: "123456",
        },
      } as any;

      const res = mockResponse();

      vi.spyOn(AuthService, "authenticate").mockResolvedValue({
        success: false,
        message: "Falha na autenticação. Verifique as credenciais.",
      });

      await AuthController.login(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Falha na autenticação. Verifique as credenciais.",
      });
    });
  });

  describe("register", () => {
    it("deve registrar um usuário com sucesso", async () => {
      const req = {
        body: {
          userName: "João",
          userEmail: "joao@email.com",
          userPassword: "123456",
          userRole: "company_worker",
          company: "company-1",
        },
        file: undefined,
      } as any;

      const res = mockResponse();

      const result = {
        success: true,
        message: "Usuário criado com sucesso.",
        token: "mock-token",
        user: {
          id: "user-1",
          userName: "João",
          userEmail: "joao@email.com",
          userRole: "company_worker",
        },
      };

      const create = vi.spyOn(AuthService, "create").mockResolvedValue(result);

      await AuthController.register(req, res, mockNext());

      expect(create).toHaveBeenCalledWith({
        userName: "João",
        userEmail: "joao@email.com",
        userPassword: "123456",
        userRole: "company_worker",
        company: "company-1",
        userImage: undefined,
      });

      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "mock-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24,
          path: "/",
        }),
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Cadastro efetuado com sucesso!",
        token: "mock-token",
        user: result.user,
      });
    });

    it("deve incluir a imagem enviada no cadastro", async () => {
      const req = {
        body: {
          userName: "João",
          userEmail: "joao@email.com",
          userPassword: "123456",
          userRole: "company_worker",
        },
        file: {
          path: "https://cloudinary.com/user.jpg",
        },
      } as any;

      const res = mockResponse();

      const create = vi.spyOn(AuthService, "create").mockResolvedValue({
        success: true,
        message: "Login efetuado com sucesso!",
        token: "mock-token",
        user: {
          id: "user-1",
          userName: "João",
          userEmail: "joao@email.com",
          userRole: "company_worker",
        },
      });

      await AuthController.register(req, res, mockNext());

      expect(create).toHaveBeenCalledWith({
        userName: "João",
        userEmail: "joao@email.com",
        userPassword: "123456",
        userRole: "company_worker",
        userImage: "https://cloudinary.com/user.jpg",
      });
    });

    it("deve retornar 400 quando o cadastro falhar", async () => {
      const req = {
        body: {
          userName: "João",
        },
        file: undefined,
      } as any;

      const res = mockResponse();

      vi.spyOn(AuthService, "create").mockResolvedValue({
        success: false,
        message: "Usuário já cadastrado.",
      });

      await AuthController.register(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuário já cadastrado.",
      });
    });

    it("deve usar mensagem padrão quando o cadastro falhar sem mensagem", async () => {
      const req = {
        body: {},
        file: undefined,
      } as any;

      const res = mockResponse();

      vi.spyOn(AuthService, "create").mockResolvedValue({
        success: false,
        message: "Não foi possível criar a conta.",
      });

      await AuthController.register(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível criar a conta.",
      });
    });
  });

  describe("logout", () => {
    it("deve limpar o cookie e realizar logout", async () => {
      const req = {} as any;

      const res = mockResponse();

      await AuthController.logout(req, res, mockNext());

      expect(res.clearCookie).toHaveBeenCalledWith("token", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      });

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logout efetuado com sucesso.",
      });
    });
  });
});
