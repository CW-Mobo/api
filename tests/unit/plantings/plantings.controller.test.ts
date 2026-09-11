import { describe, it, expect, beforeEach, vi } from "vitest";
import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import PlantingController from "../../../src/modules/plantings/plantings.controller";
import PlantingService from "../../../src/modules/plantings/plantings.service";

describe("PlantingController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockResponse = () => {
    const res = {} as Response;

    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);

    return res;
  };

  const mockNext = () => vi.fn() as NextFunction;

  const user = {
    id: "user-1",
    userRole: "company_worker",
    company: "company-1",
  };

  const plantingData = {
    plantingName: "Plantação de Lichia",
    plantingDate: new Date("2026-01-15"),
    plantedArea: 10,
    location: {
      longitude: -47.999,
      latitude: -24.487,
    },
  };

  const mockPlanting = {
    _id: new Types.ObjectId("507f1f77bcf86cd799439013"),
    ...plantingData,
    company: new Types.ObjectId("507f1f77bcf86cd799439011"),
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  };

  describe("getAllPlantings", () => {
    it("deve retornar todas as plantações", async () => {
      const req = {
        user,
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "getAll").mockResolvedValue([
        mockPlanting,
      ] as any);

      await PlantingController.getAllPlantings(req, res, next);

      expect(PlantingService.getAll).toHaveBeenCalledWith(user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        plantings: [mockPlanting],
      });
    });

    it("deve retornar 404 quando não houver plantações", async () => {
      const req = {
        user,
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "getAll").mockResolvedValue([]);

      await PlantingController.getAllPlantings(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nenhuma plantação encontrada.",
      });
    });
  });

  describe("createPlanting", () => {
    it("deve criar uma plantação com sucesso", async () => {
      const req = {
        user,
        body: plantingData,
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "create").mockResolvedValue(
        mockPlanting as any,
      );

      await PlantingController.createPlanting(req, res, next);

      expect(PlantingService.create).toHaveBeenCalledWith(user, plantingData);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Plantação cadastrada com sucesso.",
        newPlanting: mockPlanting,
      });
    });

    it("deve retornar 400 quando a plantação não puder ser criada", async () => {
      const req = {
        user,
        body: plantingData,
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "create").mockResolvedValue(null as any);

      await PlantingController.createPlanting(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível cadastrar a plantação.",
      });
    });
  });

  describe("updatePlanting", () => {
    it("deve atualizar uma plantação com sucesso", async () => {
      const req = {
        user,
        params: {
          id: "planting-1",
        },
        body: plantingData,
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "update").mockResolvedValue({
        success: true,
        message: "Plantação atualizada com sucesso.",
        planting: mockPlanting,
      });

      await PlantingController.updatePlanting(req, res, next);

      expect(PlantingService.update).toHaveBeenCalledWith(
        "planting-1",
        user,
        plantingData,
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Plantação atualizada com sucesso.",
        updatedPlanting: mockPlanting,
      });
    });

    it("deve retornar 404 quando a plantação não for encontrada", async () => {
      const req = {
        user,
        params: {
          id: "planting-1",
        },
        body: plantingData,
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "update").mockResolvedValue({
        success: false,
        message: "Plantação não encontrada.",
      });

      await PlantingController.updatePlanting(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Plantação não encontrada.",
      });
    });
  });

  describe("deletePlanting", () => {
    it("deve deletar uma plantação com sucesso", async () => {
      const req = {
        user,
        params: {
          id: "planting-1",
        },
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "delete").mockResolvedValue({
        success: true,
        message: "Plantação deletada com sucesso.",
      });

      await PlantingController.deletePlanting(req, res, next);

      expect(PlantingService.delete).toHaveBeenCalledWith("planting-1", user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Plantação deletada com sucesso.",
      });
    });

    it("deve retornar 404 quando a plantação não existir", async () => {
      const req = {
        user,
        params: {
          id: "planting-1",
        },
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "delete").mockResolvedValue({
        success: false,
        message: "Plantação não encontrada.",
      });

      await PlantingController.deletePlanting(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Plantação não encontrada.",
      });
    });
  });

  describe("getOnePlanting", () => {
    it("deve retornar uma plantação específica", async () => {
      const req = {
        user,
        params: {
          id: "planting-1",
        },
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "getOne").mockResolvedValue({
        success: true,
        planting: mockPlanting,
      });

      await PlantingController.getOnePlanting(req, res, next);

      expect(PlantingService.getOne).toHaveBeenCalledWith("planting-1", user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        planting: mockPlanting,
      });
    });

    it("deve retornar 404 quando a plantação não existir", async () => {
      const req = {
        user,
        params: {
          id: "planting-1",
        },
      } as any;

      const res = mockResponse();
      const next = mockNext();

      vi.spyOn(PlantingService, "getOne").mockResolvedValue({
        success: false,
        message: "Plantação não encontrada.",
      });

      await PlantingController.getOnePlanting(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Plantação não encontrada.",
      });
    });
  });
});
