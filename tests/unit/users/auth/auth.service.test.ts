import { describe, it, expect, vi, afterEach } from "vitest";
import bcrypt from "bcrypt";
import User from "../../../../src/modules/users/users.model";
import AuthService from "../../../../src/modules/users/auth/auth.service";
import { UserInput } from "../../../../src/modules/users/users.types";
import { generateToken } from "../../../../src/utils/jwt";

vi.mock("../../../../src/utils/jwt", () => ({
  generateToken: vi.fn(() => "mock-token"),
}));

describe("AuthService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authenticate", () => {
    it("deve autenticar um usuário com credenciais válidas", async () => {
      const user = {
        _id: {
          toString: () => "user-1",
        },
        userName: "João",
        userEmail: "joao@email.com",
        userPassword: "hashed-password",
        userPhone: "13999999999",
        userRole: "company_worker",
        company: {
          toString: () => "company-1",
        },
        farmerDetails: undefined,
        userImage: "image.jpg",
      };

      vi.spyOn(User, "findOne").mockResolvedValue(user as any);

      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      vi.spyOn({ generateToken }, "generateToken").mockReturnValue(
        "mock-token",
      );

      const result = await AuthService.authenticate({
        userEmail: " JOAO@EMAIL.COM ",
        userPassword: "123456",
      });

      expect(User.findOne).toHaveBeenCalledWith({
        userEmail: "joao@email.com",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed-password");

      expect(result).toEqual({
        success: true,
        message: "Login efetuado com sucesso!",
        token: expect.any(String),
        user: {
          id: "user-1",
          userImage: "image.jpg",
          userName: "João",
          userEmail: "joao@email.com",
          userPhone: "13999999999",
          userRole: "company_worker",
          company: "company-1",
          farmerDetails: undefined,
        },
      });
    });

    it("deve retornar erro quando o usuário não for encontrado", async () => {
      vi.spyOn(User, "findOne").mockResolvedValue(null);

      const result = await AuthService.authenticate({
        userEmail: "naoexiste@email.com",
        userPassword: "123456",
      });

      expect(User.findOne).toHaveBeenCalledWith({
        userEmail: "naoexiste@email.com",
      });

      expect(result).toEqual({
        success: false,
        message: "Usuário não encontrado.",
      });
    });

    it("deve retornar erro quando a senha estiver incorreta", async () => {
      const user = {
        _id: {
          toString: () => "user-1",
        },
        userPassword: "hashed-password",
      };

      vi.spyOn(User, "findOne").mockResolvedValue(user as any);

      vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const result = await AuthService.authenticate({
        userEmail: "joao@email.com",
        userPassword: "senha-errada",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "senha-errada",
        "hashed-password",
      );

      expect(result).toEqual({
        success: false,
        message: "Senha incorreta.",
      });
    });

    it("deve retornar erro quando ocorrer uma exceção", async () => {
      vi.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

      const result = await AuthService.authenticate({
        userEmail: "joao@email.com",
        userPassword: "123456",
      });

      expect(result).toEqual({
        success: false,
        message: "Erro ao autenticar usuário.",
      });
    });
  });

  describe("create", () => {
    it("deve retornar erro quando os campos obrigatórios não forem preenchidos", async () => {
      const data = {
        userName: "",
        userEmail: "",
        userPassword: "",
        userRole: "company_worker",
      } as UserInput;

      const result = await AuthService.create(data);

      expect(result).toEqual({
        success: false,
        message: "Campos obrigatórios não preenchidos.",
      });
    });

    it("deve retornar erro quando o usuário já estiver cadastrado", async () => {
      const data: UserInput = {
        userName: "João",
        userEmail: "JOAO@EMAIL.COM",
        userPassword: "123456",
        userRole: "company_worker",
        company: "company-1",
      };

      vi.spyOn(User, "findOne").mockResolvedValue({
        _id: "user-1",
      } as any);

      const result = await AuthService.create(data);

      expect(User.findOne).toHaveBeenCalledWith({
        userEmail: "joao@email.com",
      });

      expect(result).toEqual({
        success: false,
        message: "Usuário já cadastrado.",
      });
    });

    it("deve exigir CPF e DAP para agricultor familiar", async () => {
      const data: UserInput = {
        userName: "João",
        userEmail: "joao@email.com",
        userPassword: "123456",
        userRole: "family_farmer",
      };

      const result = await AuthService.create(data);

      expect(result).toEqual({
        success: false,
        message:
          "Campos CPF e DAP são obrigatórios para agricultores familiares.",
      });
    });

    it("deve criar um usuário comum com sucesso", async () => {
      const data: UserInput = {
        userName: "João",
        userEmail: "JOAO@EMAIL.COM",
        userPassword: "123456",
        userRole: "company_worker",
        company: "507f1f77bcf86cd799439011",
        userPhone: "13999999999",
      };

      vi.spyOn(User, "findOne").mockResolvedValue(null);

      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

      const save = vi
        .spyOn(User.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      vi.spyOn({ generateToken }, "generateToken").mockReturnValue(
        "mock-token",
      );

      const result = await AuthService.create(data);

      expect(User.findOne).toHaveBeenCalledWith({
        userEmail: "joao@email.com",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);

      expect(save).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        message: "Usuário criado com sucesso.",
        token: "mock-token",
        user: {
          id: expect.any(String),
          userImage: undefined,
          userName: "João",
          userEmail: "joao@email.com",
          userPhone: "13999999999",
          userRole: "company_worker",
          company: "507f1f77bcf86cd799439011",
          userPassword: undefined,
        },
      });
    });

    it("deve criar um agricultor familiar com CPF e DAP", async () => {
      const data: UserInput = {
        userName: "Maria",
        userEmail: "MARIA@EMAIL.COM",
        userPassword: "123456",
        userRole: "family_farmer",
        farmerDetails: {
          cpf: "123.456.789-00",
          dap: "DAP1234567",
        },
      };

      vi.spyOn(User, "findOne").mockResolvedValue(null);

      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

      vi.spyOn(User.prototype, "save").mockImplementation(async function () {
        return this;
      });

      const result = await AuthService.create(data);

      expect(result.success).toBe(true);

      expect(result.user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          userName: "Maria",
          userEmail: "maria@email.com",
          userRole: "family_farmer",
          farmerDetails: expect.objectContaining({
            cpf: "123.456.789-00",
            dap: "DAP1234567",
          }),
        }),
      );
    });

    it("deve aceitar empresa vazia e armazená-la como undefined", async () => {
      const data: UserInput = {
        userName: "João",
        userEmail: "joao@email.com",
        userPassword: "123456",
        userRole: "company_worker",
        company: "",
      };

      vi.spyOn(User, "findOne").mockResolvedValue(null);

      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

      const save = vi
        .spyOn(User.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      await AuthService.create(data);

      const createdUser = save.mock.instances[0];

      expect(createdUser).toBeDefined();
    });

    it("deve retornar erro quando ocorrer uma exceção", async () => {
      vi.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

      const data: UserInput = {
        userName: "João",
        userEmail: "joao@email.com",
        userPassword: "123456",
        userRole: "company_worker",
      };

      const result = await AuthService.create(data);

      expect(result).toEqual({
        success: false,
        message: "Erro ao criar usuário.",
      });
    });
  });
});
