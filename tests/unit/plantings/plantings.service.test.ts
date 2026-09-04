import { describe, it, expect, beforeEach, vi } from "vitest";
import Planting from "../../../src/modules/plantings/plantings.model";
import PlantingService from "../../../src/modules/plantings/plantings.service";
import {
  checkOwnership,
  ownedFields,
  assignOwnership,
} from "../../../src/utils/checkOwnership";

vi.mock("../../../src/utils/checkOwnership", () => ({
  checkOwnership: vi.fn(),
  ownedFields: vi.fn(),
  assignOwnership: vi.fn(),
}));

describe("PlantingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const companyUser = {
    id: "user-1",
    userRole: "company_worker",
    company: "507f1f77bcf86cd799439011",
  };

  const familyFarmer = {
    id: "user-2",
    userRole: "family_farmer",
    company: undefined,
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
    _id: {
      toString: () => "planting-1",
    },
    plantingName: "Plantação de Lichia",
    plantingDate: plantingData.plantingDate,
    plantedArea: 10,
    location: plantingData.location,
    user: undefined,
    company: companyUser.company,
  };

  describe("getAll", () => {
    it("deve retornar plantações da empresa para usuários de empresa", async () => {
      const find = vi
        .spyOn(Planting, "find")
        .mockResolvedValue([mockPlanting] as any);

      const result = await PlantingService.getAll(companyUser as any);

      expect(find).toHaveBeenCalledWith({
        company: companyUser.company,
      });

      expect(result).toEqual([mockPlanting]);
    });

    it("deve retornar apenas as plantações do agricultor familiar", async () => {
      const find = vi.spyOn(Planting, "find").mockResolvedValue([
        {
          ...mockPlanting,
          user: familyFarmer.id,
          company: undefined,
        },
      ] as any);

      const result = await PlantingService.getAll(familyFarmer as any);

      expect(find).toHaveBeenCalledWith({
        user: familyFarmer.id,
      });

      expect(result).toHaveLength(1);
    });

    it("deve retornar um array vazio quando não houver plantações", async () => {
      const find = vi.spyOn(Planting, "find").mockResolvedValue([]);

      const result = await PlantingService.getAll(companyUser as any);

      expect(find).toHaveBeenCalledWith({
        company: companyUser.company,
      });

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("deve criar uma plantação com sucesso", async () => {
      const save = vi
        .spyOn(Planting.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await PlantingService.create(
        companyUser as any,
        plantingData as any,
      );

      expect(assignOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );

      expect(save).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result.plantingName).toBe(plantingData.plantingName);
      expect(result.plantedArea).toBe(plantingData.plantedArea);
      expect(result.location).toEqual(plantingData.location);
    });

    it("deve criar uma plantação para agricultor familiar", async () => {
      const save = vi
        .spyOn(Planting.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await PlantingService.create(
        familyFarmer as any,
        plantingData as any,
      );

      expect(assignOwnership).toHaveBeenCalledWith(
        familyFarmer,
        expect.any(Object),
      );

      expect(save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("deve atualizar uma plantação com sucesso", async () => {
      vi.spyOn(Planting, "findById").mockResolvedValue(mockPlanting as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: "507f1f77bcf86cd799439012",
        company: companyUser.company,
      });

      const updatedPlanting = {
        ...mockPlanting,
        plantingName: "Plantação atualizada",
      };

      const update = vi
        .spyOn(Planting, "findByIdAndUpdate")
        .mockResolvedValue(updatedPlanting as any);

      const result = await PlantingService.update(
        "planting-1",
        companyUser as any,
        {
          ...plantingData,
          plantingName: "Plantação atualizada",
        },
      );

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });

      expect(update).toHaveBeenCalledWith(
        "planting-1",
        {
          ...plantingData,
          plantingName: "Plantação atualizada",
        },
        {
          new: true,
        },
      );

      expect(result).toEqual({
        success: true,
        message: "Plantação atualizada com sucesso.",
        planting: updatedPlanting,
      });
    });

    it("deve retornar erro quando a plantação não existe", async () => {
      const find = vi.spyOn(Planting, "findById").mockResolvedValue(null);

      const update = vi.spyOn(Planting, "findByIdAndUpdate");

      const result = await PlantingService.update(
        "planting-1",
        companyUser as any,
        plantingData as any,
      );

      expect(find).toHaveBeenCalledWith("planting-1");
      expect(update).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Plantação não encontrada.",
      });
    });

    it("deve verificar a propriedade da plantação antes de atualizar", async () => {
      vi.spyOn(Planting, "findById").mockResolvedValue(mockPlanting as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: "507f1f77bcf86cd799439012",
        company: companyUser.company,
      });

      vi.spyOn(Planting, "findByIdAndUpdate").mockResolvedValue(
        mockPlanting as any,
      );

      await PlantingService.update(
        "planting-1",
        companyUser as any,
        plantingData as any,
      );

      expect(ownedFields).toHaveBeenCalledWith(mockPlanting);

      expect(checkOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );
    });
  });

  describe("delete", () => {
    it("deve deletar uma plantação com sucesso", async () => {
      vi.spyOn(Planting, "findById").mockResolvedValue(mockPlanting as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: "507f1f77bcf86cd799439012",
        company: companyUser.company,
      });

      const deleteById = vi
        .spyOn(Planting, "findByIdAndDelete")
        .mockResolvedValue(mockPlanting as any);

      const result = await PlantingService.delete(
        "planting-1",
        companyUser as any,
      );

      expect(checkOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );

      expect(deleteById).toHaveBeenCalledWith("planting-1");

      expect(result).toEqual({
        success: true,
        message: "Plantação deletada com sucesso.",
      });
    });

    it("deve retornar erro quando a plantação não existe", async () => {
      const find = vi.spyOn(Planting, "findById").mockResolvedValue(null);

      const deleteById = vi.spyOn(Planting, "findByIdAndDelete");

      const result = await PlantingService.delete(
        "planting-1",
        companyUser as any,
      );

      expect(find).toHaveBeenCalledWith("planting-1");
      expect(deleteById).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Plantação não encontrada.",
      });
    });

    it("deve verificar a propriedade antes de deletar", async () => {
      vi.spyOn(Planting, "findById").mockResolvedValue(mockPlanting as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: "507f1f77bcf86cd799439012",
        company: companyUser.company,
      });

      vi.spyOn(Planting, "findByIdAndDelete").mockResolvedValue(
        mockPlanting as any,
      );

      await PlantingService.delete("planting-1", companyUser as any);

      expect(ownedFields).toHaveBeenCalledWith(mockPlanting);

      expect(checkOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );
    });
  });

  describe("getOne", () => {
    it("deve retornar uma plantação com sucesso", async () => {
      vi.spyOn(Planting, "findById").mockResolvedValue(mockPlanting as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: "507f1f77bcf86cd799439012",
        company: companyUser.company,
      });

      const result = await PlantingService.getOne(
        "planting-1",
        companyUser as any,
      );

      expect(Planting.findById).toHaveBeenCalledWith("planting-1");

      expect(ownedFields).toHaveBeenCalledWith(mockPlanting);

      expect(checkOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );

      expect(result).toEqual({
        success: true,
        planting: mockPlanting,
      });
    });

    it("deve retornar erro quando a plantação não existe", async () => {
      const find = vi.spyOn(Planting, "findById").mockResolvedValue(null);

      const result = await PlantingService.getOne(
        "planting-1",
        companyUser as any,
      );

      expect(find).toHaveBeenCalledWith("planting-1");

      expect(result).toEqual({
        success: false,
        message: "Plantação não encontrada.",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
    });
  });
});
