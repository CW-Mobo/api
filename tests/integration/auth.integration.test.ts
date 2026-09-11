import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { connectDB } from "../../src/config/db";
import User from "../../src/modules/users/users.model";
import Company from "../../src/modules/companies/companies.model";

vi.mock("../../src/config/cloudinary", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    uploadUsers: {
      single: vi.fn(() => (_req: any, _res: any, next: any) => next()),
    },
    uploadHarvests: {
      single: vi.fn(() => (_req: any, _res: any, next: any) => next()),
    },
  };
});

const BASE_URL = "/api/auth";

describe("Auth - Integration Tests", () => {
  let companyId: string;
  let jwtSecret: string;

  const companyData = {
    companyCNPJ: "12345678000199",
    ownerName: "Test Owner",
    companyName: "Test Company",
    companyAddress: {
      state: "SP",
      city: "Registro",
      zipCode: "11900-000",
    },
  };

  const userData = {
    userName: "Test User",
    userEmail: "test@example.com",
    userPassword: "Password123!",
    userPhone: "13999999999",
    userRole: "company_worker" as const,
  };

  beforeAll(async () => {
    jwtSecret = process.env.JWT_SECRET || "";

    if (!jwtSecret) {
      throw new Error("JWT_SECRET não configurado para os testes.");
    }

    await connectDB();

    await User.deleteMany({});
    await Company.deleteMany({});

    const company = await Company.create(companyData);
    companyId = company._id.toString();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Company.deleteMany({});

    await mongoose.connection.close();
  });

  describe("POST /api/auth/register", () => {
    it("deve registrar um novo usuário", async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          ...userData,
          company: companyId,
        });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Cadastro efetuado com sucesso!");

      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();

      expect(response.body.user.userName).toBe(userData.userName);
      expect(response.body.user.userEmail).toBe(userData.userEmail);
      expect(response.body.user.userRole).toBe(userData.userRole);
      expect(response.body.user.company).toBe(companyId);

      const user = await User.findOne({
        userEmail: userData.userEmail,
      });

      expect(user).not.toBeNull();
      expect(user?.userPassword).not.toBe(userData.userPassword);

      const passwordMatches = await bcrypt.compare(
        userData.userPassword,
        user!.userPassword,
      );

      expect(passwordMatches).toBe(true);
    });

    it("deve normalizar o e-mail para lowercase e trim", async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          ...userData,
          userEmail: "  TEST@EXAMPLE.COM  ",
          company: companyId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.user.userEmail).toBe("test@example.com");

      const user = await User.findOne({
        userEmail: "test@example.com",
      });

      expect(user).not.toBeNull();
    });

    it("não deve permitir cadastro com campos obrigatórios ausentes", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        userName: "Test User",
        userEmail: "test@example.com",
      });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Campos obrigatórios não preenchidos.",
      );
    });

    it("não deve permitir cadastro com e-mail já existente", async () => {
      await User.create({
        ...userData,
        company: companyId,
        userPassword: await bcrypt.hash(userData.userPassword, 10),
      });

      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          ...userData,
          company: companyId,
        });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Usuário já cadastrado.");
    });

    it("deve exigir CPF e DAP para agricultor familiar", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        userName: "Family Farmer",
        userEmail: "farmer@example.com",
        userPassword: "Password123!",
        userRole: "family_farmer",
      });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Campos CPF e DAP são obrigatórios para agricultores familiares.",
      );
    });

    it("deve registrar agricultor familiar com CPF e DAP", async () => {
      const response = await request(app)
        .post(`${BASE_URL}/register`)
        .send({
          userName: "Family Farmer",
          userEmail: "farmer@example.com",
          userPassword: "Password123!",
          userRole: "family_farmer",
          farmerDetails: {
            cpf: "123.456.789-00",
            dap: "BR1234567890",
          },
        });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.userRole).toBe("family_farmer");
      expect(response.body.user.farmerDetails).toEqual({
        _id: expect.any(String),
        cpf: "123.456.789-00",
        dap: "BR1234567890",
      });
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        ...userData,
        company: companyId,
        userPassword: await bcrypt.hash(userData.userPassword, 10),
      });
    });

    it("deve realizar login com credenciais válidas", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login efetuado com sucesso!");

      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();

      expect(response.body.user.userEmail).toBe(userData.userEmail);
      expect(response.body.user.userName).toBe(userData.userName);

      expect(response.headers["set-cookie"]).toBeDefined();

      const cookies = response.headers["set-cookie"] as unknown as string[];

      expect(cookies.some((cookie) => cookie.startsWith("token="))).toBe(true);
    });

    it("deve aceitar e-mail com espaços e letras maiúsculas", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userEmail: "  TEST@EXAMPLE.COM  ",
        userPassword: userData.userPassword,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it("deve retornar 400 quando e-mail não for informado", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userPassword: userData.userPassword,
      });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("E-mail e senha são obrigatórios.");
    });

    it("deve retornar 400 quando senha não for informada", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userEmail: userData.userEmail,
      });

      expect(response.status).toBe(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("E-mail e senha são obrigatórios.");
    });

    it("deve retornar 401 quando usuário não existir", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userEmail: "notfound@example.com",
        userPassword: userData.userPassword,
      });

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Usuário não encontrado.");
    });

    it("deve retornar 401 quando a senha estiver incorreta", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userEmail: userData.userEmail,
        userPassword: "WrongPassword123!",
      });

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Senha incorreta.");
    });

    it("deve retornar um JWT contendo os dados do usuário", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });

      expect(response.status).toBe(200);

      const token = response.body.token;

      const payload = jwt.verify(token, jwtSecret) as {
        id: string;
        userRole: string;
        company?: string;
      };

      expect(payload.id).toBeDefined();
      expect(payload.userRole).toBe(userData.userRole);
      expect(payload.company).toBe(companyId);
    });
  });

  describe("GET /api/auth/logout", () => {
    it("deve realizar logout com token válido", async () => {
      const user = await User.create({
        ...userData,
        company: companyId,
        userPassword: await bcrypt.hash(userData.userPassword, 10),
      });

      const token = jwt.sign(
        {
          id: user._id.toString(),
          userRole: user.userRole,
          company: companyId,
        },
        jwtSecret,
      );

      const response = await request(app)
        .get(`${BASE_URL}/logout`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logout efetuado com sucesso.");

      expect(response.headers["set-cookie"]).toBeDefined();

      const cookies = response.headers["set-cookie"] as unknown as string[];

      expect(
        cookies.some(
          (cookie) =>
            cookie.startsWith("token=;") || cookie.includes("token=;"),
        ),
      ).toBe(true);
    });

    it("não deve permitir logout sem token", async () => {
      const response = await request(app).get(`${BASE_URL}/logout`);

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });

    it("não deve permitir logout com token inválido", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/logout`)
        .set("Authorization", "Bearer token-invalido");

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Não autorizado.");
    });
  });
});
