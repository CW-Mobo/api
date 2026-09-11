import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Response, NextFunction } from "express";
import HarvestImageController from "../../../src/modules/harvest-images/harvest-images.controller";
import HarvestImageService from "../../../src/modules/harvest-images/harvest-images.service";

vi.mock("../../../src/modules/harvest-images/harvest-images.service", () => ({
  default: {
    getUserImages: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

describe("HarvestImageController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const user = {
    id: "507f1f77bcf86cd799439012",
    userRole: "company_worker",
    company: "507f1f77bcf86cd799439011",
  };

  const mockImage = {
    _id: "507f1f77bcf86cd799439013",
    user: user.id,
    imageName: "harvest-image.jpg",
    createdAt: new Date("2026-01-15"),
  };

  const req = {
    user,
  };

  const createResponseMock = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    return res as unknown as Response;
  };

  const next = vi.fn() as NextFunction;

  describe("getUserImages", () => {
    it("deve retornar as imagens do usuário com sucesso", async () => {
      const res = createResponseMock();

      vi.mocked(HarvestImageService.getUserImages).mockResolvedValue([
        mockImage,
      ] as any);

      await HarvestImageController.getUserImages(req as any, res, next);

      expect(HarvestImageService.getUserImages).toHaveBeenCalledWith(user.id);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        images: [mockImage],
      });
    });

    it("deve retornar uma lista vazia quando nenhuma imagem for encontrada", async () => {
      const res = createResponseMock();

      vi.mocked(HarvestImageService.getUserImages).mockResolvedValue([]);

      await HarvestImageController.getUserImages(req as any, res, next);

      expect(HarvestImageService.getUserImages).toHaveBeenCalledWith(user.id);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        images: [],
      });
    });
  });

  describe("uploadImage", () => {
    it("deve retornar erro quando nenhum arquivo for enviado", async () => {
      const res = createResponseMock();

      const uploadReq = {
        ...req,
        file: undefined,
      };

      await HarvestImageController.uploadImage(uploadReq as any, res, next);

      expect(HarvestImageService.uploadImage).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nenhum arquivo foi enviado.",
      });
    });

    it("deve fazer upload da imagem com sucesso", async () => {
      const res = createResponseMock();

      const uploadReq = {
        ...req,
        file: {
          filename: "harvest-image.jpg",
          path: "/uploads/harvest-image.jpg",
        },
      };

      const serviceResult = {
        success: true,
        image: mockImage,
      };

      vi.mocked(HarvestImageService.uploadImage).mockResolvedValue(
        serviceResult as any,
      );

      await HarvestImageController.uploadImage(uploadReq as any, res, next);

      expect(HarvestImageService.uploadImage).toHaveBeenCalledWith(
        user.id,
        "harvest-image.jpg",
      );

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Imagem enviada com sucesso!",
        image: serviceResult,
      });
    });

    it("deve utilizar o filename do arquivo enviado", async () => {
      const res = createResponseMock();

      const uploadReq = {
        ...req,
        file: {
          filename: "lichia-2026-01.jpg",
          path: "/uploads/lichia-2026-01.jpg",
        },
      };

      vi.mocked(HarvestImageService.uploadImage).mockResolvedValue({
        success: true,
        image: mockImage,
      } as any);

      await HarvestImageController.uploadImage(uploadReq as any, res, next);

      expect(HarvestImageService.uploadImage).toHaveBeenCalledWith(
        user.id,
        "lichia-2026-01.jpg",
      );
    });
  });
});
