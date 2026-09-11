import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app";
import { connectDB } from "../../src/config/db";
import Company from "../../src/modules/companies/companies.model";

const BASE_URL = "/api/companies";

describe("Companies - Integration Tests", () => {
  let token: string;

  const userPayload = {
    id: new mongoose.Types.ObjectId().toString(),
    userRole: "admin",
    company: new mongoose.Types.ObjectId().toString(),
  };

  const companyData = {
    companyCNPJ: "12345678000195",
    ownerName: "João da Silva",
    companyName: "Empresa Teste",
    companyAddress: {
      state: "SP",
      city: "Registro",
      zipCode: "11900-000",
    },
  };

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET não definido.");
    }

    // Conecta ao banco antes de executar operações com o MongoDB
    await connectDB();

    token = jwt.sign(userPayload, secret);

    await Company.deleteMany({});
  });

  beforeEach(async () => {
    await Company.deleteMany({});
  });

  afterAll(async () => {
    await Company.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/companies", () => {
    it("deve retornar todas as empresas", async () => {
      await Company.create(companyData);

      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].companyName).toBe("Empresa Teste");
    });

    it("deve retornar 404 quando não houver empresas", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Nenhuma empresa encontrada.");
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

  describe("POST /api/companies", () => {
    it("deve criar uma empresa", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Empresa criada com sucesso.");

      expect(response.body.newCompany.companyCNPJ).toBe(
        companyData.companyCNPJ,
      );

      expect(response.body.newCompany.ownerName).toBe(companyData.ownerName);

      expect(response.body.newCompany.companyName).toBe(
        companyData.companyName,
      );

      const company = await Company.findOne({
        companyCNPJ: companyData.companyCNPJ,
      });

      expect(company).not.toBeNull();
      expect(company?.companyName).toBe("Empresa Teste");
    });

    it("deve aceitar CNPJ formatado", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...companyData,
          companyCNPJ: "12.345.678/0001-95",
        });

      expect(response.status).toBe(201);

      const company = await Company.findOne({
        companyCNPJ: "12345678000195",
      });

      expect(company).not.toBeNull();
    });

    it("deve retornar 400 quando os campos obrigatórios não forem informados", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          companyName: "Empresa Teste",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Campos obrigatórios ausentes: CNPJ, nome da empresa ou responsável.",
      );
    });

    it("deve retornar 400 quando o CNPJ for inválido", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...companyData,
          companyCNPJ: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("CNPJ inválido.");
    });

    it("deve retornar 400 quando o CNPJ já estiver cadastrado", async () => {
      await Company.create(companyData);

      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send(companyData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("CNPJ já cadastrado.");
    });
  });

  describe("GET /api/companies/:id", () => {
    it("deve retornar uma empresa pelo ID", async () => {
      const company = await Company.create(companyData);

      const response = await request(app)
        .get(`${BASE_URL}/${company._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.company.companyName).toBe("Empresa Teste");
    });

    it("deve retornar 404 quando a empresa não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Empresa não encontrada.");
    });

    it("deve rejeitar um ID inválido", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).not.toBe(200);
    });
  });

  describe("PUT /api/companies/:id", () => {
    it("deve atualizar uma empresa", async () => {
      const company = await Company.create(companyData);

      const response = await request(app)
        .put(`${BASE_URL}/${company._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...companyData,
          companyName: "Empresa Atualizada",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Empresa atualizada com sucesso.");

      expect(response.body.updatedCompany.companyName).toBe(
        "Empresa Atualizada",
      );

      const updatedCompany = await Company.findById(company._id);

      expect(updatedCompany?.companyName).toBe("Empresa Atualizada");
    });

    it("deve retornar 404 quando a empresa não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(companyData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/companies/:id", () => {
    it("deve deletar uma empresa", async () => {
      const company = await Company.create(companyData);

      const response = await request(app)
        .delete(`${BASE_URL}/${company._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Empresa deletada com sucesso.");

      const deletedCompany = await Company.findById(company._id);

      expect(deletedCompany).toBeNull();
    });

    it("deve retornar 404 quando a empresa não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Empresa não encontrada.");
    });
  });
});
