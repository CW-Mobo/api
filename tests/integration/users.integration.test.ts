import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app";
import { connectDB } from "../../src/config/db";
import User from "../../src/modules/users/users.model";
import Company from "../../src/modules/companies/companies.model";

const BASE_URL = "/api/users";

describe("Users - Integration Tests", () => {
  let token: string;
  let userId: mongoose.Types.ObjectId;
  let companyId: mongoose.Types.ObjectId;

  const userData = {
    userName: "João Silva",
    userEmail: "joao.teste@example.com",
    userPassword: "123456",
    userPhone: "(13) 99999-9999",
    userRole: "company_worker" as const,
  };

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET não definido.");
    }

    await connectDB();

    const company = await Company.create({
      companyCNPJ: "12345678000199",
      ownerName: "Test Owner",
      companyName: "Test Company",
      companyAddress: {
        state: "SP",
        city: "Registro",
        zipCode: "11900-000",
      },
    });

    companyId = company._id;

    const user = await User.create({
      ...userData,
      company: companyId,
    });

    userId = user._id;

    token = jwt.sign(
      {
        id: userId.toString(),
        userRole: "company_worker",
        company: companyId.toString(),
      },
      secret,
    );
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Company.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/users", () => {
    it("deve retornar todos os usuários da empresa", async () => {
      await User.create({
        ...userData,
        userEmail: "outro.usuario@example.com",
        company: companyId,
      });

      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].userName).toBe("João Silva");
    });

    it("deve retornar 404 quando não houver usuários na empresa", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Nenhum usuário encontrado para esta empresa.",
      );
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const response = await request(app).get(BASE_URL);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });

    it("deve retornar 401 quando o token for inválido", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", "Bearer token-invalido");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Não autorizado.");
    });
  });

  describe("GET /api/users/me", () => {
    it("deve retornar o usuário autenticado", async () => {
      const user = await User.create({
        ...userData,
        company: companyId,
      });

      const userToken = jwt.sign(
        {
          id: user._id.toString(),
          userRole: "company_worker",
          company: companyId.toString(),
        },
        process.env.JWT_SECRET!,
      );

      const response = await request(app)
        .get(`${BASE_URL}/me`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.userName).toBe("João Silva");
      expect(response.body.user.userEmail).toBe("joao.teste@example.com");

      expect(response.body.user.userPassword).toBeUndefined();
    });

    it("deve retornar 404 quando o usuário não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const userToken = jwt.sign(
        {
          id: id.toString(),
          userRole: "company_worker",
          company: companyId.toString(),
        },
        process.env.JWT_SECRET!,
      );

      const response = await request(app)
        .get(`${BASE_URL}/me`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Usuário não encontrado.");
    });
  });

  describe("PUT /api/users", () => {
    it("deve atualizar o usuário autenticado", async () => {
      const user = await User.create({
        ...userData,
        company: companyId,
      });

      const userToken = jwt.sign(
        {
          id: user._id.toString(),
          userRole: "company_worker",
          company: companyId.toString(),
        },
        process.env.JWT_SECRET!,
      );

      const response = await request(app)
        .put(BASE_URL)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          userName: "João Atualizado",
          userPhone: "(13) 98888-8888",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Usuário atualizado com sucesso.");

      expect(response.body.updatedUser.userName).toBe("João Atualizado");

      expect(response.body.updatedUser.userPhone).toBe("(13) 98888-8888");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser?.userName).toBe("João Atualizado");
      expect(updatedUser?.userPhone).toBe("(13) 98888-8888");
    });

    it("deve atualizar e criptografar a senha do usuário", async () => {
      const user = await User.create({
        ...userData,
        company: companyId,
      });

      const userToken = jwt.sign(
        {
          id: user._id.toString(),
          userRole: "company_worker",
          company: companyId.toString(),
        },
        process.env.JWT_SECRET!,
      );

      const response = await request(app)
        .put(BASE_URL)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          userPassword: "novaSenha123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedUser = await User.findById(user._id).select("+userPassword");

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.userPassword).not.toBe("novaSenha123");
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const response = await request(app).put(BASE_URL).send({
        userName: "João Atualizado",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("deve deletar o usuário autenticado", async () => {
      const user = await User.create({
        ...userData,
        company: companyId,
      });

      const userToken = jwt.sign(
        {
          id: user._id.toString(),
          userRole: "company_worker",
          company: companyId.toString(),
        },
        process.env.JWT_SECRET!,
      );

      const response = await request(app)
        .delete(`${BASE_URL}/${user._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Conta deletada com sucesso.");

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`${BASE_URL}/${id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });

    it("deve rejeitar um ID inválido", async () => {
      const response = await request(app)
        .delete(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).not.toBe(200);
    });
  });
});
