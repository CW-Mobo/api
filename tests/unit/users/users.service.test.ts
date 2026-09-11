import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import bcrypt from "bcrypt";

import User from "../../../src/modules/users/users.model";
import UserService from "../../../src/modules/users/users.service";

import { UserInput } from "../../../src/modules/users/users.types";

describe("UserService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAll", () => {
    it("deve retornar todos os usuários de uma empresa", async () => {
      const users = [
        {
          _id: "user-1",
          userName: "João",
          userEmail: "joao@email.com",
          userRole: "company_worker",
          company: "company-1",
        },
        {
          _id: "user-2",
          userName: "Maria",
          userEmail: "maria@email.com",
          userRole: "company_worker",
          company: "company-1",
        },
      ];

      const find = vi.spyOn(User, "find").mockResolvedValue(users as any);

      const result = await UserService.getAll("company-1");

      expect(find).toHaveBeenCalledWith({
        company: "company-1",
      });

      expect(result).toEqual(users);
    });

    it("deve retornar todos os usuários quando companyId não for informado", async () => {
      const users = [
        {
          _id: "user-1",
          userName: "João",
        },
      ];

      const find = vi.spyOn(User, "find").mockResolvedValue(users as any);

      const result = await UserService.getAll();

      expect(find).toHaveBeenCalledWith({});
      expect(result).toEqual(users);
    });

    it("deve retornar uma lista vazia quando não houver usuários", async () => {
      vi.spyOn(User, "find").mockResolvedValue([]);

      const result = await UserService.getAll("company-1");

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("deve atualizar um usuário", async () => {
      const userData: Partial<UserInput> = {
        userName: "João Atualizado",
        userPhone: "13999999999",
      };

      const updatedUser = {
        _id: "user-1",
        ...userData,
      };

      const findByIdAndUpdate = vi
        .spyOn(User, "findByIdAndUpdate")
        .mockResolvedValue(updatedUser as any);

      const result = await UserService.update("user-1", userData);

      expect(findByIdAndUpdate).toHaveBeenCalledWith(
        "user-1",
        userData,
        { new: true },
      );

      expect(result).toEqual(updatedUser);
    });

    it("deve remover company quando receber uma string vazia", async () => {
      const userData: Partial<UserInput> = {
        userName: "João",
        company: "",
      };

      const expectedData = {
        userName: "João",
        company: undefined,
      };

      const findByIdAndUpdate = vi
        .spyOn(User, "findByIdAndUpdate")
        .mockResolvedValue({} as any);

      await UserService.update("user-1", userData);

      expect(findByIdAndUpdate).toHaveBeenCalledWith(
        "user-1",
        expectedData,
        { new: true },
      );
    });

    it("deve criptografar a senha quando ela for atualizada", async () => {
      const hashedPassword = "hashed-password";

      vi.spyOn(bcrypt, "hash").mockResolvedValue(
        hashedPassword as never,
      );

      const findByIdAndUpdate = vi
        .spyOn(User, "findByIdAndUpdate")
        .mockResolvedValue({} as any);

      const userData: Partial<UserInput> = {
        userPassword: "123456",
      };

      await UserService.update("user-1", userData);

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);

      expect(findByIdAndUpdate).toHaveBeenCalledWith(
        "user-1",
        {
          userPassword: hashedPassword,
        },
        { new: true },
      );
    });

    it("deve retornar null quando o usuário não existir", async () => {
      vi.spyOn(User, "findByIdAndUpdate").mockResolvedValue(null);

      const result = await UserService.update("user-1", {
        userName: "João",
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deve deletar o usuário", async () => {
      const destroy = vi
        .spyOn(
          (UserService as any),
          "deleteUserImage",
        )
        .mockResolvedValue(undefined);

      const findByIdAndDelete = vi
        .spyOn(User, "findByIdAndDelete")
        .mockResolvedValue({} as any);

      const result = await UserService.delete("user-1");

      expect(destroy).toHaveBeenCalledWith("user-1");
      expect(findByIdAndDelete).toHaveBeenCalledWith("user-1");

      expect(result).toEqual({
        success: true,
        message: "Usuário deletado com sucesso",
      });
    });
  });

  describe("getOne", () => {
    it("deve buscar um usuário sem retornar a senha", async () => {
      const user = {
        _id: "user-1",
        userName: "João",
        userEmail: "joao@email.com",
      };

      const select = vi.fn().mockResolvedValue(user);

      vi.spyOn(User, "findById").mockReturnValue({
        select,
      } as any);

      const result = await UserService.getOne("user-1");

      expect(User.findById).toHaveBeenCalledWith("user-1");
      expect(select).toHaveBeenCalledWith("-userPassword");
      expect(result).toEqual(user);
    });

    it("deve retornar null quando o usuário não existir", async () => {
      const select = vi.fn().mockResolvedValue(null);

      vi.spyOn(User, "findById").mockReturnValue({
        select,
      } as any);

      const result = await UserService.getOne("user-1");

      expect(result).toBeNull();
    });
  });
});