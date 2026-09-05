import { describe, it, expect, beforeEach, vi } from "vitest";
import { Response, NextFunction } from "express";
import HarvestController from "../../../src/modules/harvests/harvests.controller";
import HarvestService from "../../../src/modules/harvests/harvests.service";

vi.mock("../../../src/modules/harvests/harvests.service", () => ({
  default: {
    getAll: vi.fn(),
    getPaginated: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    getOne: vi.fn(),
  },
}));

describe("HarvestController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const user = {
    id: "507f1f77bcf86cd799439012",
    userRole: "company_worker",
    company: "507f1f77bcf86cd799439011",
  };

  const mockHarvest = {
    _id: "507f1f77bcf86cd799439013",
    harvestedQuantity: 50,
    quality: 90,
    harvestDate: new Date("2026-01-15"),
    harvestStart: "08:00",
    harvestEnd: "12:00",
    harvestDuration: "4",
    planting: "507f1f77bcf86cd799439010",
    company: "507f1f77bcf86cd799439011",
  };

  const harvestData = {
    harvestedQuantity: 50,
    quality: 90,
    harvestDate: new Date("2026-01-15"),
    harvestStart: new Date("2026-01-15T08:00:00"),
    harvestEnd: new Date("2026-01-15T12:00:00"),
    harvestDuration: 4,
    planting: "507f1f77bcf86cd799439010",
  };

  const req = {
    user,
    body: harvestData,
    params: {},
    query: {},
  } as any;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  describe("getAllHarvests", () => {
    it("deve retornar todas as colheitas com sucesso", async () => {
      vi.mocked(HarvestService.getAll).mockResolvedValue([mockHarvest] as any);

      await HarvestController.getAllHarvests(req, res, next);

      expect(HarvestService.getAll).toHaveBeenCalledWith(user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        harvests: [mockHarvest],
      });
    });

    it("deve retornar mensagem quando não existem colheitas", async () => {
      vi.mocked(HarvestService.getAll).mockResolvedValue([]);

      await HarvestController.getAllHarvests(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Nenhuma colheita encontrada.",
      });
    });
  });

  describe("getPaginatedHarvests", () => {
    it("deve retornar colheitas paginadas", async () => {
      const paginatedResult = {
        results: [mockHarvest],
        totalPages: 3,
        total: 25,
        currentPage: 2,
      };

      const paginatedReq = {
        ...req,
        query: {
          page: "2",
          limit: "10",
        },
      };

      vi.mocked(HarvestService.getPaginated).mockResolvedValue(
        paginatedResult as any,
      );

      await HarvestController.getPaginatedHarvests(paginatedReq, res, next);

      expect(HarvestService.getPaginated).toHaveBeenCalledWith(user, 2, 10);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        harvests: [mockHarvest],
        totalPages: 3,
        totalCount: 25,
        currentPage: 2,
      });
    });

    it("deve usar página 1 e limite 10 por padrão", async () => {
      const paginatedReq = {
        ...req,
        query: {},
      };

      vi.mocked(HarvestService.getPaginated).mockResolvedValue({
        results: [mockHarvest],
        totalPages: 1,
        total: 1,
        currentPage: 1,
      } as any);

      await HarvestController.getPaginatedHarvests(paginatedReq, res, next);

      expect(HarvestService.getPaginated).toHaveBeenCalledWith(user, 1, 10);
    });

    it("deve retornar mensagem quando não existem colheitas na página", async () => {
      const paginatedReq = {
        ...req,
        query: {
          page: "2",
          limit: "10",
        },
      };

      vi.mocked(HarvestService.getPaginated).mockResolvedValue({
        results: [],
        totalPages: 3,
        total: 25,
        currentPage: 2,
      } as any);

      await HarvestController.getPaginatedHarvests(paginatedReq, res, next);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Nenhuma colheita nesta página.",
        harvests: [],
        totalPages: 3,
        totalCount: 25,
        currentPage: 2,
      });
    });
  });

  describe("createHarvest", () => {
    it("deve criar uma colheita com sucesso", async () => {
      vi.mocked(HarvestService.create).mockResolvedValue(mockHarvest as any);

      await HarvestController.createHarvest(req, res, next);

      expect(HarvestService.create).toHaveBeenCalledWith(user, harvestData);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Colheita cadastrada com sucesso.",
        newHarvest: mockHarvest,
      });
    });

    it("deve retornar 400 quando o ID da plantação é inválido", async () => {
      const invalidReq = {
        ...req,
        body: {
          ...harvestData,
          planting: "id-invalido",
        },
      };

      await HarvestController.createHarvest(invalidReq, res, next);

      expect(HarvestService.create).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ID inválido.",
      });
    });

    it("deve retornar 400 quando a criação falha", async () => {
      vi.mocked(HarvestService.create).mockResolvedValue(null as any);

      await HarvestController.createHarvest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível cadastrar a colheita.",
      });
    });
  });

  describe("updateHarvest", () => {
    it("deve atualizar uma colheita com sucesso", async () => {
      const updateReq = {
        ...req,
        params: {
          id: mockHarvest._id,
        },
      };

      vi.mocked(HarvestService.update).mockResolvedValue({
        success: true,
        message: "Colheita atualizada com sucesso.",
        harvest: mockHarvest,
      } as any);

      await HarvestController.updateHarvest(updateReq, res, next);

      expect(HarvestService.update).toHaveBeenCalledWith(
        mockHarvest._id,
        user,
        harvestData,
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Colheita atualizada com sucesso.",
        updatedHarvest: mockHarvest,
      });
    });

    it("deve retornar 404 quando a colheita não existe", async () => {
      const updateReq = {
        ...req,
        params: {
          id: mockHarvest._id,
        },
      };

      vi.mocked(HarvestService.update).mockResolvedValue({
        success: false,
        message: "Colheita não encontrada ou não pôde ser atualizada.",
      });

      await HarvestController.updateHarvest(updateReq, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Colheita não encontrada ou não pôde ser atualizada.",
      });
    });
  });

  describe("deleteManyHarvests", () => {
    it("deve deletar várias colheitas com sucesso", async () => {
      const deleteReq = {
        ...req,
        body: {
          ids: [mockHarvest._id, "507f1f77bcf86cd799439014"],
        },
      };

      vi.mocked(HarvestService.deleteMany).mockResolvedValue({
        success: true,
        message: "Colheitas deletadas com sucesso.",
      });

      await HarvestController.deleteManyHarvests(deleteReq, res, next);

      expect(HarvestService.deleteMany).toHaveBeenCalledWith(
        user,
        deleteReq.body.ids,
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Colheitas deletadas com sucesso.",
      });
    });

    it("deve retornar 400 quando nenhum ID é informado", async () => {
      const deleteReq = {
        ...req,
        body: {
          ids: [],
        },
      };

      await HarvestController.deleteManyHarvests(deleteReq, res, next);

      expect(HarvestService.deleteMany).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nenhum ID foi informado para exclusão.",
      });
    });

    it("deve retornar erro quando o service falha", async () => {
      const deleteReq = {
        ...req,
        body: {
          ids: ["id-invalido"],
        },
      };

      vi.mocked(HarvestService.deleteMany).mockResolvedValue({
        success: false,
        message: "IDs inválidos.",
      });

      await HarvestController.deleteManyHarvests(deleteReq, res, next);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "IDs inválidos.",
      });
    });
  });

  describe("getOneHarvest", () => {
    it("deve retornar uma colheita com sucesso", async () => {
      const getReq = {
        ...req,
        params: {
          id: mockHarvest._id,
        },
      };

      vi.mocked(HarvestService.getOne).mockResolvedValue(mockHarvest as any);

      await HarvestController.getOneHarvest(getReq, res, next);

      expect(HarvestService.getOne).toHaveBeenCalledWith(mockHarvest._id, user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        harvest: mockHarvest,
      });
    });

    it("deve retornar 404 quando a colheita não existe", async () => {
      const getReq = {
        ...req,
        params: {
          id: mockHarvest._id,
        },
      };

      vi.mocked(HarvestService.getOne).mockResolvedValue(null);

      await HarvestController.getOneHarvest(getReq, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Colheita não encontrada.",
      });
    });
  });
});
