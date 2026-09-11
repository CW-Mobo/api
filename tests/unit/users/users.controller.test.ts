import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from "vitest";

import { Response, NextFunction } from "express";

import UserController from "../../../src/modules/users/users.controller";
import UserService from "../../../src/modules/users/users.service";

const mockResponse = () => {
  const res = {} as Response;

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

const mockNext = () => vi.fn() as NextFunction;

describe("UserController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAllUsers", () => {
    it("deve retornar todos os usuários da empresa", async () => {
      const req = {
        user: {
          id: "user-1",
          company: "company-1",
        },
      } as any;

      const res = mockResponse();

      const users = [
        {
          _id: "user-2",
          userName: "Maria",
          userEmail: "maria@email.com",
        },
        {
          _id: "user-3",
          userName: "João",
          userEmail: "joao@email.com",
        },
      ];

      vi.spyOn(UserService, "getAll").mockResolvedValue(users as any);

      await UserController.getAllUsers(
        req,
        res,
        mockNext(),
      );

      expect(UserService.getAll).toHaveBeenCalledWith(
        "company-1",
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        users,
      });
    });

    it("deve retornar 404 quando não houver usuários", async () => {
      const req = {
        user: {
          id: "user-1",
          company: "company-1",
        },
      } as any;

      const res = mockResponse();

      vi.spyOn(UserService, "getAll").mockResolvedValue([]);

      await UserController.getAllUsers(
        req,
        res,
        mockNext(),
      );

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Nenhum usuário encontrado para esta empresa.",
      });
    });
  });

  describe("updateUser", () => {
    it("deve atualizar o usuário sem imagem", async () => {
      const req = {
        user: {
          id: "user-1",
        },
        body: {
          userName: "João Atualizado",
          userPhone: "13999999999",
        },
        file: undefined,
      } as any;

      const res = mockResponse();

      const updatedUser = {
        _id: "user-1",
        userName: "João Atualizado",
        userPhone: "13999999999",
      };

      vi.spyOn(UserService, "update").mockResolvedValue(
        updatedUser as any,
      );

      await UserController.updateUser(
        req,
        res,
        mockNext(),
      );

      expect(UserService.update).toHaveBeenCalledWith(
        "user-1",
        {
          userName: "João Atualizado",
          userPhone: "13999999999",
          userImage: undefined,
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuário atualizado com sucesso.",
        updatedUser,
      });
    });

    it("deve atualizar o usuário com imagem", async () => {
      const req = {
        user: {
          id: "user-1",
        },
        body: {
          userName: "João",
        },
        file: {
          path: "https://cloudinary.com/mobo/users/user-1.jpg",
        },
      } as any;

      const res = mockResponse();

      const updatedUser = {
        _id: "user-1",
        userName: "João",
        userImage:
          "https://cloudinary.com/mobo/users/user-1.jpg",
      };

      vi.spyOn(UserService, "update").mockResolvedValue(
        updatedUser as any,
      );

      await UserController.updateUser(
        req,
        res,
        mockNext(),
      );

      expect(UserService.update).toHaveBeenCalledWith(
        "user-1",
        {
          userName: "João",
          userImage:
            "https://cloudinary.com/mobo/users/user-1.jpg",
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deve retornar 400 quando não conseguir atualizar", async () => {
      const req = {
        user: {
          id: "user-1",
        },
        body: {
          userName: "João",
        },
        file: undefined,
      } as any;

      const res = mockResponse();

      vi.spyOn(UserService, "update").mockResolvedValue(null);

      await UserController.updateUser(
        req,
        res,
        mockNext(),
      );

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível atualizar o usuário.",
      });
    });
  });

  describe("deleteUser", () => {
    it("deve deletar a conta do usuário logado", async () => {
      const req = {
        user: {
          id: "user-1",
        },
      } as any;

      const res = mockResponse();

      const deleteSpy = vi
        .spyOn(UserService, "delete")
        .mockResolvedValue({
          success: true,
          message: "Usuário deletado com sucesso",
        });

      await UserController.deleteUser(
        req,
        res,
        mockNext(),
      );

      expect(deleteSpy).toHaveBeenCalledWith("user-1");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Conta deletada com sucesso.",
      });
    });
  });

  describe("getUser", () => {
    it("deve retornar o usuário logado", async () => {
      const req = {
        user: {
          id: "user-1",
        },
      } as any;

      const res = mockResponse();

      const user = {
        _id: "user-1",
        userName: "João",
        userEmail: "joao@email.com",
        userRole: "company_worker",
      };

      vi.spyOn(UserService, "getOne").mockResolvedValue(
        user as any,
      );

      await UserController.getUser(
        req,
        res,
        mockNext(),
      );

      expect(UserService.getOne).toHaveBeenCalledWith(
        "user-1",
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user,
      });
    });

    it("deve retornar 404 quando o usuário não existir", async () => {
      const req = {
        user: {
          id: "user-1",
        },
      } as any;

      const res = mockResponse();

      vi.spyOn(UserService, "getOne").mockResolvedValue(null);

      await UserController.getUser(
        req,
        res,
        mockNext(),
      );

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuário não encontrado.",
      });
    });
  });
});