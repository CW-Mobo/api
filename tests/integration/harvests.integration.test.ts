import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import app from "../../src/app";
import { connectDB } from "../../src/config/db";
import Company from "../../src/modules/companies/companies.model";
import User from "../../src/modules/users/users.model";
import Planting from "../../src/modules/plantings/plantings.model";
import Harvest from "../../src/modules/harvests/harvests.model";

const BASE_URL = "/api/harvests";

describe("Harvests Integration Tests", () => {
  let token: string;
  let userId: mongoose.Types.ObjectId;
  let companyId: mongoose.Types.ObjectId;
  let plantingId: mongoose.Types.ObjectId;

  const harvestData = {
    harvestedQuantity: 50,
    quality: 90,
    harvestDate: "2026-08-20",
    harvestStart: "08:00",
    harvestEnd: "10:00",
    harvestDuration: "02:00",
    planting: "",
  };

  beforeAll(async () => {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não definido.");
    }

    await connectDB();

    const company = await Company.create({
      companyCNPJ: "12345678000199",
      ownerName: "Harvest Test Owner",
      companyName: "Harvest Test Company",
      companyAddress: {
        state: "SP",
        city: "Registro",
        zipCode: "11900000",
      },
    });

    companyId = company._id;

    const user = await User.create({
      userName: "Harvest Test User",
      userEmail: "harvest@test.com",
      userPassword: "hashed-password",
      userRole: "company_admin",
      company: companyId,
    });

    userId = user._id;

    token = jwt.sign(
      {
        id: userId.toString(),
        userRole: user.userRole,
        company: companyId.toString(),
      },
      process.env.JWT_SECRET,
    );

    const planting = await Planting.create({
      plantingName: "Plantação de Teste",
      plantingDate: new Date("2026-08-01"),
      plantedArea: 100,
      location: {
        longitude: -47.55,
        latitude: -24.49,
      },
      user: userId,
      company: companyId,
    });

    plantingId = planting._id;
    harvestData.planting = plantingId.toString();
  });

  beforeEach(async () => {
    await Harvest.deleteMany({});
  });

  afterAll(async () => {
    await Harvest.deleteMany({});
    await Planting.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/harvests", () => {
    it("deve listar todas as colheitas", async () => {
      await Harvest.create({
        ...harvestData,
        planting: plantingId,
        user: userId,
        company: companyId,
      });

      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.harvests).toHaveLength(1);
    });

    it("deve retornar 200 quando não houver colheitas", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Nenhuma colheita encontrada.");
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app).get(BASE_URL);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("deve retornar 401 com token inválido", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", "Bearer token-invalido");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/harvests/paginated", () => {
    it("deve listar colheitas com paginação", async () => {
      await Harvest.create({
        ...harvestData,
        planting: plantingId,
        user: userId,
        company: companyId,
      });

      const response = await request(app)
        .get(`${BASE_URL}/paginated?page=1&limit=10`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.harvests).toHaveLength(1);
      expect(response.body.currentPage).toBe(1);
    });

    it("deve retornar lista vazia quando não houver colheitas", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/paginated?page=1&limit=10`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.harvests).toEqual([]);
      expect(response.body.message).toBe("Nenhuma colheita nesta página.");
    });

    it("deve limitar a página a no máximo 20 registros", async () => {
      for (let i = 0; i < 21; i++) {
        await Harvest.create({
          ...harvestData,
          harvestedQuantity: i + 1,
          planting: plantingId,
          user: userId,
          company: companyId,
        });
      }

      const response = await request(app)
        .get(`${BASE_URL}/paginated?page=1&limit=100`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.harvests.length).toBeLessThanOrEqual(20);
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app).get(`${BASE_URL}/paginated`);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/harvests", () => {
    it("deve criar uma colheita", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send(harvestData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Colheita cadastrada com sucesso.");
      expect(response.body.newHarvest).toBeDefined();
    });

    it("deve retornar 400 para planting inválido", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...harvestData,
          planting: "id-invalido",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("ID inválido.");
    });

    it("deve retornar 400 quando a quantidade colhida for zero", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...harvestData,
          harvestedQuantity: 0,
        });

      expect(response.status).toBe(500);
    });

    it("deve retornar 400 quando a quantidade colhida for negativa", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...harvestData,
          harvestedQuantity: -10,
        });

      expect(response.status).toBe(500);
    });

    it("deve retornar 500 quando o fim da colheita for anterior ao início", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...harvestData,
          harvestStart: "12:00",
          harvestEnd: "10:00",
        });

      expect(response.status).toBe(500);
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .send(harvestData);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/harvests/:id", () => {
    it("deve buscar uma colheita específica", async () => {
      const harvest = await Harvest.create({
        ...harvestData,
        planting: plantingId,
        user: userId,
        company: companyId,
      });

      const response = await request(app)
        .get(`${BASE_URL}/${harvest._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.harvest._id).toBe(harvest._id.toString());
    });

    it("deve retornar 404 para colheita inexistente", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Colheita não encontrada.");
    });

    it("deve retornar 400 para ID inválido", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("deve retornar 401 sem token", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app).get(`${BASE_URL}/${id}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/harvests/:id", () => {
    it("deve atualizar uma colheita", async () => {
      const harvest = await Harvest.create({
        ...harvestData,
        planting: plantingId,
        user: userId,
        company: companyId,
      });

      const response = await request(app)
        .put(`${BASE_URL}/${harvest._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...harvestData,
          harvestedQuantity: 75,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.updatedHarvest.harvestedQuantity).toBe(75);
    });

    it("deve retornar 404 para colheita inexistente", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(harvestData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("deve retornar 400 para ID inválido", async () => {
      const response = await request(app)
        .put(`${BASE_URL}/id-invalido`)
        .set("Authorization", `Bearer ${token}`)
        .send(harvestData);

      expect(response.status).toBe(400);
    });

    it("deve retornar 401 sem token", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`${BASE_URL}/${id}`)
        .send(harvestData);

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/harvests", () => {
    it("deve deletar várias colheitas", async () => {
      const harvest1 = await Harvest.create({
        ...harvestData,
        planting: plantingId,
        user: userId,
        company: companyId,
      });

      const harvest2 = await Harvest.create({
        ...harvestData,
        harvestedQuantity: 100,
        planting: plantingId,
        user: userId,
        company: companyId,
      });

      const response = await request(app)
        .delete(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ids: [harvest1._id.toString(), harvest2._id.toString()],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Colheitas deletadas com sucesso.");

      const remaining = await Harvest.countDocuments();
      expect(remaining).toBe(0);
    });

    it("deve retornar 400 quando nenhum ID for informado", async () => {
      const response = await request(app)
        .delete(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Nenhum ID foi informado para exclusão.",
      );
    });

    it("deve retornar 400 para IDs inválidos", async () => {
      const response = await request(app)
        .delete(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ids: ["id-invalido"],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("IDs inválidos.");
    });

    it("deve retornar 400 quando nenhuma colheita for encontrada", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          ids: [id.toString()],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Nenhuma colheita encontrada.");
    });

    it("deve retornar 401 sem token", async () => {
      const response = await request(app)
        .delete(BASE_URL)
        .send({
          ids: [new mongoose.Types.ObjectId().toString()],
        });

      expect(response.status).toBe(401);
    });
  });

  describe("Ownership", () => {
    it("não deve permitir acessar uma colheita de outra empresa", async () => {
      const otherCompany = await Company.create({
        companyCNPJ: "98765432000188",
        ownerName: "Other Owner",
        companyName: "Other Company",
        companyAddress: {
          state: "SP",
          city: "Registro",
        },
      });

      const otherUser = await User.create({
        userName: "Other User",
        userEmail: "other-harvest@test.com",
        userPassword: "hashed-password",
        userRole: "company_admin",
        company: otherCompany._id,
      });

      const otherHarvest = await Harvest.create({
        ...harvestData,
        planting: plantingId,
        user: otherUser._id,
        company: otherCompany._id,
      });

      const response = await request(app)
        .get(`${BASE_URL}/${otherHarvest._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);

      await Harvest.deleteOne({ _id: otherHarvest._id });
      await User.deleteOne({ _id: otherUser._id });
      await Company.deleteOne({ _id: otherCompany._id });
    });
  });
});
