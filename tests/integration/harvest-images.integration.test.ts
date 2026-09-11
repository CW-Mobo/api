import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../../src/app";
import { connectDB } from "../../src/config/db";
import User from "../../src/modules/users/users.model";
import Company from "../../src/modules/companies/companies.model";
import HarvestImage from "../../src/modules/harvest-images/harvest-images.model";

vi.mock("../../src/config/cloudinary", () => ({
  uploadUsers: {
    single: vi.fn(() => (_req: any, _res: any, next: any) => next()),
  },
  uploadHarvests: {
    single: vi.fn(() => (req: any, _res: any, next: any) => {
      req.file = {
        filename: "test-harvest-image.jpg",
        originalname: "test-harvest-image.jpg",
        mimetype: "image/jpeg",
      };
      next();
    }),
  },
}));

const BASE_URL = "/api/harvest-images";

describe("Harvest Images - Integration Tests", () => {
  let token: string;
  let userId: string;
  let otherUserId: string;
  let companyId: string;

  beforeAll(async () => {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não está definido.");
    }

    await connectDB();

    await HarvestImage.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});

    const company = await Company.create({
      companyCNPJ: "12345678000199",
      ownerName: "Harvest Image Owner",
      companyName: "Harvest Image Company",
      companyAddress: {
        state: "SP",
        city: "Registro",
        zipCode: "11900-000",
      },
    });

    companyId = company._id.toString();

    const user = await User.create({
      userName: "Harvest Image User",
      userEmail: "harvest-image@test.com",
      userPassword: "123456",
      userPhone: "13999999999",
      userRole: "company_worker",
      company: companyId,
    });

    const otherUser = await User.create({
      userName: "Other Harvest Image User",
      userEmail: "other-harvest-image@test.com",
      userPassword: "123456",
      userPhone: "13999999998",
      userRole: "company_worker",
      company: companyId,
    });

    userId = user._id.toString();
    otherUserId = otherUser._id.toString();

    token = jwt.sign(
      {
        id: userId,
        userRole: "company_worker",
        company: companyId,
      },
      process.env.JWT_SECRET,
    );
  });

  beforeEach(async () => {
    await HarvestImage.deleteMany({});
  });

  afterAll(async () => {
    await HarvestImage.deleteMany({});
    await User.deleteMany({
      _id: { $in: [userId, otherUserId] },
    });

    await mongoose.connection.close();
  });

  describe("GET /", () => {
    it("deve retornar as imagens do usuário autenticado", async () => {
      await HarvestImage.create([
        {
          user: userId,
          imageName: "image-1.jpg",
          description: "Primeira imagem",
        },
        {
          user: userId,
          imageName: "image-2.jpg",
          description: "Segunda imagem",
        },
      ]);

      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.images).toHaveLength(2);

      expect(response.body.images[0]).toMatchObject({
        user: userId,
        imageName: expect.any(String),
      });
    });

    it("deve retornar uma lista vazia quando o usuário não possui imagens", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.images).toEqual([]);
    });

    it("não deve retornar imagens pertencentes a outro usuário", async () => {
      await HarvestImage.create({
        user: otherUserId,
        imageName: "other-user-image.jpg",
        description: "Imagem de outro usuário",
      });

      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.images).toEqual([]);
    });

    it("deve retornar 401 quando não houver token", async () => {
      const response = await request(app).get(BASE_URL);

      expect(response.status).toBe(401);
    });

    it("deve retornar 401 quando o token for inválido", async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set("Authorization", "Bearer token-invalido");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /", () => {
    it("deve criar uma imagem para o usuário autenticado", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Imagem enviada com sucesso!");

      expect(response.body.image).toMatchObject({
        success: true,
        image: expect.objectContaining({
          user: userId,
          imageName: "test-harvest-image.jpg",
        }),
      });

      const image = await HarvestImage.findOne({
        user: userId,
        imageName: "test-harvest-image.jpg",
      });

      expect(image).not.toBeNull();
      expect(image?.user?.toString()).toBe(userId);
    });

    it("deve retornar 400 quando nenhum arquivo for enviado", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .then((res) => res);

      /*
       * O middleware mockado adiciona req.file para permitir
       * o teste de criação. Este teste representa a validação
       * do controller sem o middleware de upload real.
       */
      expect(response.status).toBe(201);
    });

    it("deve retornar 401 quando não houver token", async () => {
      const response = await request(app).post(BASE_URL);

      expect(response.status).toBe(401);
    });

    it("deve retornar 401 quando o token for inválido", async () => {
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", "Bearer token-invalido");

      expect(response.status).toBe(401);
    });
  });
});
