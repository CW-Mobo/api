import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app";
import { connectDB } from "../../src/config/db";
import Planting from "../../src/modules/plantings/plantings.model";
import User from "../../src/modules/users/users.model";
import Company from "../../src/modules/companies/companies.model";

const BASE_URL = "/api/plantings";

describe("Plantings - Integration Tests", () => {
  let token: string;
  let userId: mongoose.Types.ObjectId;
  let companyId: mongoose.Types.ObjectId;

  const userData = {
    userName: "João Silva",
    userEmail: "joao.planting@example.com",
    userPassword: "123456",
    userPhone: "(13) 99999-9999",
    userRole: "company_worker" as const,
  };

  const plantingData = {
    plantingName: "Plantação de Lichia",
    plantingDate: new Date("2026-08-20"),
    plantedArea: 5000,
    location: {
      longitude: -47.573,
      latitude: -24.487,
    },
  };

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET não definido.");
    }

    await connectDB();

    const company = await Company.create({
      companyCNPJ: "98765432000199",
      ownerName: "Planting Test Owner",
      companyName: "Planting Test Company",
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
    await Planting.deleteMany({});
  });

  afterAll(async () => {
    await Planting.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/plantings", () => {
    it("deve retornar todas as plantações da empresa", async () => {
      await Planting.create({
        ...plantingData,
        company: companyId,
      });

      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.plantings).toHaveLength(1);
      expect(response.body.plantings[0].plantingName).toBe(
        "Plantação de Lichia",
      );
    });

    it("deve retornar 404 quando não houver plantações", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Nenhuma plantação encontrada.");
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

  describe("POST /api/plantings", () => {
    it("deve criar uma plantação", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send(plantingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Plantação cadastrada com sucesso.");

      expect(response.body.newPlanting.plantingName).toBe(
        "Plantação de Lichia",
      );
      expect(response.body.newPlanting.plantedArea).toBe(5000);
      expect(response.body.newPlanting.location.longitude).toBe(-47.573);
      expect(response.body.newPlanting.location.latitude).toBe(-24.487);

      const planting = await Planting.findById(response.body.newPlanting._id);

      expect(planting).not.toBeNull();
      expect(planting?.company?.toString()).toBe(companyId.toString());
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .send(plantingData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });
  });

  describe("GET /api/plantings/:id", () => {
    it("deve retornar uma plantação", async () => {
      const planting = await Planting.create({
        ...plantingData,
        company: companyId,
      });

      const response = await request(app)
        .get(`${BASE_URL}/${planting._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.planting.plantingName).toBe("Plantação de Lichia");
      expect(response.body.planting._id).toBe(planting._id.toString());
    });

    it("deve retornar 404 quando a plantação não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Plantação não encontrada.");
    });

    it("deve rejeitar um ID inválido", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).not.toBe(200);
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app).get(`${BASE_URL}/${id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });
  });

  describe("PUT /api/plantings/:id", () => {
    it("deve atualizar uma plantação", async () => {
      const planting = await Planting.create({
        ...plantingData,
        company: companyId,
      });

      const response = await request(app)
        .put(`${BASE_URL}/${planting._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          plantingName: "Plantação Atualizada",
          plantingDate: new Date("2026-08-25"),
          plantedArea: 7500,
          location: {
            longitude: -47.574,
            latitude: -24.488,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Plantação atualizada com sucesso.");
      expect(response.body.updatedPlanting.plantingName).toBe(
        "Plantação Atualizada",
      );
      expect(response.body.updatedPlanting.plantedArea).toBe(7500);

      const updatedPlanting = await Planting.findById(planting._id);

      expect(updatedPlanting?.plantingName).toBe("Plantação Atualizada");
      expect(updatedPlanting?.plantedArea).toBe(7500);
    });

    it("deve retornar 404 quando a plantação não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(plantingData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Plantação não encontrada.");
    });

    it("deve rejeitar um ID inválido", async () => {
      const response = await request(app)
        .put(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`)
        .send(plantingData);

      expect(response.status).not.toBe(200);
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`${BASE_URL}/${id}`)
        .send(plantingData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });
  });

  describe("DELETE /api/plantings/:id", () => {
    it("deve deletar uma plantação", async () => {
      const planting = await Planting.create({
        ...plantingData,
        company: companyId,
      });

      const response = await request(app)
        .delete(`${BASE_URL}/${planting._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Plantação deletada com sucesso.");

      const deletedPlanting = await Planting.findById(planting._id);

      expect(deletedPlanting).toBeNull();
    });

    it("deve retornar 404 quando a plantação não existir", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Plantação não encontrada.");
    });

    it("deve rejeitar um ID inválido", async () => {
      const response = await request(app)
        .delete(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).not.toBe(200);
    });

    it("deve retornar 401 quando o token não for informado", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`${BASE_URL}/${id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token não fornecido.");
    });
  });
});
