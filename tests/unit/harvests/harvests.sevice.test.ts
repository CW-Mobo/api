import { describe, it, expect, beforeEach, vi } from "vitest";
import { Types } from "mongoose";
import Harvest from "../../../src/modules/harvests/harvests.model";
import HarvestService from "../../../src/modules/harvests/harvests.service";
import {
  checkOwnership,
  ownedFields,
  assignOwnership,
} from "../../../src/utils/checkOwnership";
import { paginate } from "../../../src/utils/paginate";

vi.mock("../../../src/utils/checkOwnership", () => ({
  checkOwnership: vi.fn(),
  ownedFields: vi.fn(),
  assignOwnership: vi.fn(),
}));

vi.mock("../../../src/utils/paginate", () => ({
  paginate: vi.fn(),
}));

describe("HarvestService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.mocked(checkOwnership).mockReturnValue(undefined);
    vi.mocked(ownedFields).mockReturnValue({
      user: undefined,
      company: undefined,
    });

    vi.mocked(assignOwnership).mockImplementation(() => undefined);
  });

  const companyUser = {
    id: "507f1f77bcf86cd799439012",
    userRole: "company_worker",
    company: "507f1f77bcf86cd799439011",
  };

  const farmerUser = {
    id: "507f1f77bcf86cd799439012",
    userRole: "family_farmer",
  };

  const plantingId = new Types.ObjectId("507f1f77bcf86cd799439010");

  const harvestData = {
    harvestedQuantity: 50,
    quality: 90,
    harvestDate: new Date("2026-01-15"),
    harvestStart: new Date("2026-01-15T08:00:00"),
    harvestEnd: new Date("2026-01-15T12:00:00"),
    harvestDuration: 4,
    planting: plantingId.toString(),
  };

  const mockHarvest = {
    _id: new Types.ObjectId("507f1f77bcf86cd799439013"),
    harvestedQuantity: 50,
    quality: 90,
    harvestDate: new Date("2026-01-15"),
    harvestStart: "2026-01-15T08:00:00",
    harvestEnd: "2026-01-15T12:00:00",
    harvestDuration: "4",
    planting: plantingId,
    company: new Types.ObjectId("507f1f77bcf86cd799439011"),
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  };

  describe("getAll", () => {
    it("deve retornar todas as colheitas de uma empresa", async () => {
      const populate = vi.fn().mockResolvedValue([mockHarvest]);

      vi.spyOn(Harvest, "find").mockReturnValue({
        populate,
      } as any);

      const result = await HarvestService.getAll(companyUser as any);

      expect(Harvest.find).toHaveBeenCalledWith({
        company: companyUser.company,
      });

      expect(populate).toHaveBeenCalledWith("planting");
      expect(result).toEqual([mockHarvest]);
    });

    it("deve retornar todas as colheitas de um agricultor familiar", async () => {
      const populate = vi.fn().mockResolvedValue([mockHarvest]);

      vi.spyOn(Harvest, "find").mockReturnValue({
        populate,
      } as any);

      const result = await HarvestService.getAll(farmerUser as any);

      expect(Harvest.find).toHaveBeenCalledWith({
        user: farmerUser.id,
      });

      expect(populate).toHaveBeenCalledWith("planting");
      expect(result).toEqual([mockHarvest]);
    });
  });

  describe("getPaginated", () => {
    it("deve retornar colheitas paginadas", async () => {
      const paginatedResult = {
        results: [mockHarvest],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      };

      vi.mocked(paginate).mockResolvedValue(paginatedResult as any);

      const result = await HarvestService.getPaginated(
        companyUser as any,
        1,
        10,
      );

      expect(paginate).toHaveBeenCalledWith(
        Harvest,
        {
          company: companyUser.company,
        },
        1,
        10,
        { harvestDate: -1 },
        ["planting"],
      );

      expect(result).toEqual(paginatedResult);
    });

    it("deve corrigir página menor que 1 para página 1", async () => {
      vi.mocked(paginate).mockResolvedValue({
        results: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      } as any);

      await HarvestService.getPaginated(companyUser as any, 0, 10);

      expect(paginate).toHaveBeenCalledWith(
        Harvest,
        { company: companyUser.company },
        1,
        10,
        { harvestDate: -1 },
        ["planting"],
      );
    });

    it("deve limitar o máximo de registros por página a 20", async () => {
      vi.mocked(paginate).mockResolvedValue({
        results: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      } as any);

      await HarvestService.getPaginated(companyUser as any, 1, 50);

      expect(paginate).toHaveBeenCalledWith(
        Harvest,
        { company: companyUser.company },
        1,
        20,
        { harvestDate: -1 },
        ["planting"],
      );
    });

    it("deve usar o usuário como filtro para agricultor familiar", async () => {
      vi.mocked(paginate).mockResolvedValue({
        results: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      } as any);

      await HarvestService.getPaginated(farmerUser as any, 1, 10);

      expect(paginate).toHaveBeenCalledWith(
        Harvest,
        { user: farmerUser.id },
        1,
        10,
        { harvestDate: -1 },
        ["planting"],
      );
    });
  });

  describe("create", () => {
    it("deve criar uma colheita com sucesso", async () => {
      const save = vi
        .spyOn(Harvest.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await HarvestService.create(
        companyUser as any,
        harvestData as any,
      );

      expect(assignOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );

      expect(save).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result.harvestedQuantity).toBe(harvestData.harvestedQuantity);
      expect(result.quality).toBe(harvestData.quality);
      expect(result.planting.toString()).toBe(harvestData.planting);
    });

    it("deve rejeitar quantidade colhida igual a zero", async () => {
      const invalidData = {
        ...harvestData,
        harvestedQuantity: 0,
      };

      await expect(
        HarvestService.create(companyUser as any, invalidData as any),
      ).rejects.toThrow("A quantidade colhida deve ser maior que zero.");

      expect(assignOwnership).not.toHaveBeenCalled();
    });

    it("deve rejeitar quantidade colhida negativa", async () => {
      const invalidData = {
        ...harvestData,
        harvestedQuantity: -10,
      };

      await expect(
        HarvestService.create(companyUser as any, invalidData as any),
      ).rejects.toThrow("A quantidade colhida deve ser maior que zero.");
    });

    it("deve rejeitar data final anterior ao início", async () => {
      const invalidData = {
        ...harvestData,
        harvestStart: new Date("2026-01-15T12:00:00"),
        harvestEnd: new Date("2026-01-15T08:00:00"),
      };

      await expect(
        HarvestService.create(companyUser as any, invalidData as any),
      ).rejects.toThrow(
        "A data final da colheita não pode ser anterior ao início.",
      );
    });
  });

  describe("update", () => {
    it("deve atualizar uma colheita com sucesso", async () => {
      vi.spyOn(Harvest, "findById").mockResolvedValue(mockHarvest as any);

      vi.spyOn(Harvest, "findByIdAndUpdate").mockResolvedValue(
        mockHarvest as any,
      );

      vi.mocked(ownedFields).mockReturnValue({
        user: undefined,
        company: companyUser.company,
      });

      const result = await HarvestService.update(
        mockHarvest._id.toString(),
        companyUser as any,
        harvestData as any,
      );

      expect(Harvest.findById).toHaveBeenCalledWith(mockHarvest._id.toString());

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });

      expect(Harvest.findByIdAndUpdate).toHaveBeenCalledWith(
        mockHarvest._id.toString(),
        harvestData,
        { new: true },
      );

      expect(result).toEqual({
        success: true,
        message: "Colheita atualizada com sucesso.",
        harvest: mockHarvest,
      });
    });

    it("deve retornar erro quando a colheita não existe", async () => {
      vi.spyOn(Harvest, "findById").mockResolvedValue(null);

      const result = await HarvestService.update(
        "507f1f77bcf86cd799439013",
        companyUser as any,
        harvestData as any,
      );

      expect(result).toEqual({
        success: false,
        message: "Colheita não encontrada",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
    });

    it("deve rejeitar atualização com quantidade inválida", async () => {
      vi.spyOn(Harvest, "findById").mockResolvedValue(mockHarvest as any);

      const invalidData = {
        ...harvestData,
        harvestedQuantity: 0,
      };

      await expect(
        HarvestService.update(
          mockHarvest._id.toString(),
          companyUser as any,
          invalidData as any,
        ),
      ).rejects.toThrow("A quantidade colhida deve ser maior que zero.");
    });

    it("deve rejeitar atualização com datas inválidas", async () => {
      vi.spyOn(Harvest, "findById").mockResolvedValue(mockHarvest as any);

      const invalidData = {
        ...harvestData,
        harvestStart: new Date("2026-01-15T12:00:00"),
        harvestEnd: new Date("2026-01-15T08:00:00"),
      };

      await expect(
        HarvestService.update(
          mockHarvest._id.toString(),
          companyUser as any,
          invalidData as any,
        ),
      ).rejects.toThrow(
        "A data final da colheita não pode ser anterior ao início.",
      );
    });
  });

  describe("deleteMany", () => {
    it("deve deletar várias colheitas com sucesso", async () => {
      const secondHarvest = {
        ...mockHarvest,
        _id: new Types.ObjectId("507f1f77bcf86cd799439014"),
      };

      vi.spyOn(Harvest, "find").mockResolvedValue([
        mockHarvest,
        secondHarvest,
      ] as any);

      const deleteMany = vi
        .spyOn(Harvest, "deleteMany")
        .mockResolvedValue({ deletedCount: 2 } as any);

      vi.mocked(ownedFields)
        .mockReturnValueOnce({
          user: undefined,
          company: companyUser.company,
        })
        .mockReturnValueOnce({
          user: undefined,
          company: companyUser.company,
        });

      const ids = [mockHarvest._id.toString(), secondHarvest._id.toString()];

      const result = await HarvestService.deleteMany(companyUser as any, ids);

      expect(Harvest.find).toHaveBeenCalledWith({
        _id: {
          $in: ids,
        },
      });

      expect(checkOwnership).toHaveBeenCalledTimes(2);

      expect(deleteMany).toHaveBeenCalledWith({
        _id: {
          $in: ids,
        },
      });

      expect(result).toEqual({
        success: true,
        message: "Colheitas deletadas com sucesso.",
      });
    });

    it("deve aceitar um único ID", async () => {
      vi.spyOn(Harvest, "find").mockResolvedValue([mockHarvest] as any);

      vi.spyOn(Harvest, "deleteMany").mockResolvedValue({
        deletedCount: 1,
      } as any);

      const id = mockHarvest._id.toString();

      const result = await HarvestService.deleteMany(
        companyUser as any,
        id as any,
      );

      expect(result.success).toBe(true);

      expect(Harvest.find).toHaveBeenCalledWith({
        _id: {
          $in: [id],
        },
      });
    });

    it("deve retornar erro quando os IDs são inválidos", async () => {
      const result = await HarvestService.deleteMany(companyUser as any, [
        "id-invalido",
        "outro-id-invalido",
      ]);

      expect(result).toEqual({
        success: false,
        message: "IDs inválidos.",
      });

      expect(Harvest.find).not.toHaveBeenCalled();
    });

    it("deve retornar erro quando nenhuma colheita é encontrada", async () => {
      vi.spyOn(Harvest, "find").mockResolvedValue([]);

      const result = await HarvestService.deleteMany(companyUser as any, [
        mockHarvest._id.toString(),
      ]);

      expect(result).toEqual({
        success: false,
        message: "Nenhuma colheita encontrada.",
      });
    });
  });

  describe("getOne", () => {
    it("deve retornar uma colheita com sucesso", async () => {
      const populate = vi.fn().mockResolvedValue(mockHarvest);

      vi.spyOn(Harvest, "findById").mockReturnValue({
        populate,
      } as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: undefined,
        company: companyUser.company,
      });

      const result = await HarvestService.getOne(
        mockHarvest._id.toString(),
        companyUser as any,
      );

      expect(Harvest.findById).toHaveBeenCalledWith(mockHarvest._id.toString());

      expect(populate).toHaveBeenCalledWith("planting");

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });

      expect(result).toEqual(mockHarvest);
    });

    it("deve retornar null quando a colheita não existe", async () => {
      const populate = vi.fn().mockResolvedValue(null);

      vi.spyOn(Harvest, "findById").mockReturnValue({
        populate,
      } as any);

      const result = await HarvestService.getOne(
        "507f1f77bcf86cd799439013",
        companyUser as any,
      );

      expect(result).toBeNull();
      expect(checkOwnership).not.toHaveBeenCalled();
    });
  });
});
