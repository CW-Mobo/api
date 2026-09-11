import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SensorData from "../../../src/modules/sensor-data/sensor-data.model";
import SensorDataService from "../../../src/modules/sensor-data/sensor-data.service";
import { checkOwnership } from "../../../src/utils/checkOwnership";

vi.mock("../../../src/utils/checkOwnership", () => ({
  checkOwnership: vi.fn(),
}));

describe("SensorDataService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.mocked(checkOwnership).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const companyUser = {
    id: "507f1f77bcf86cd799439012",
    userRole: "company_worker",
    company: "507f1f77bcf86cd799439011",
  };

  const farmerUser = {
    id: "507f1f77bcf86cd799439013",
    userRole: "family_farmer",
  };

  const sensorDataInput = {
    temperature: 25,
    soilHumidity: 60,
    airHumidity: 70,
    planting: "507f1f77bcf86cd799439015" as any,
    sensor: "507f1f77bcf86cd799439014" as any,
  };

  const mockSensor = {
    _id: "507f1f77bcf86cd799439014",
    sensorType: ["temperature"],
    user: companyUser.id,
    company: companyUser.company,
  };

  const mockPlanting = {
    _id: "507f1f77bcf86cd799439015",
  };

  const mockSensorData = {
    _id: "507f1f77bcf86cd799439016",
    temperature: 25,
    soilHumidity: 60,
    airHumidity: 70,
    alerts: [],
    planting: mockPlanting,
    sensor: mockSensor,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  };

  describe("getAll", () => {
    it("deve retornar todos os dados de sensor da empresa", async () => {
      const populatedData = [
        {
          ...mockSensorData,
          sensor: mockSensor,
          planting: mockPlanting,
        },
      ];

      const populateSecond = vi.fn().mockResolvedValue(populatedData);
      const populateFirst = vi.fn().mockReturnValue({
        populate: populateSecond,
      });

      vi.spyOn(SensorData, "find").mockReturnValue({
        populate: populateFirst,
      } as any);

      const result = await SensorDataService.getAll(companyUser as any);

      expect(SensorData.find).toHaveBeenCalledWith();

      expect(populateFirst).toHaveBeenCalledWith({
        path: "sensor",
        match: {
          company: companyUser.company,
        },
        select: "sensorType user company",
      });

      expect(populateSecond).toHaveBeenCalledWith("planting");

      expect(result).toEqual(populatedData);
    });

    it("deve usar o usuário como filtro para agricultor familiar", async () => {
      const populatedData = [
        {
          ...mockSensorData,
          sensor: mockSensor,
          planting: mockPlanting,
        },
      ];

      const populateSecond = vi.fn().mockResolvedValue(populatedData);
      const populateFirst = vi.fn().mockReturnValue({
        populate: populateSecond,
      });

      vi.spyOn(SensorData, "find").mockReturnValue({
        populate: populateFirst,
      } as any);

      const result = await SensorDataService.getAll(farmerUser as any);

      expect(SensorData.find).toHaveBeenCalledWith();

      expect(populateFirst).toHaveBeenCalledWith({
        path: "sensor",
        match: {
          user: farmerUser.id,
        },
        select: "sensorType user company",
      });

      expect(populateSecond).toHaveBeenCalledWith("planting");

      expect(result).toEqual(populatedData);
    });

    it("deve remover dados cujo sensor não foi encontrado", async () => {
      const populatedData = [
        {
          ...mockSensorData,
          sensor: mockSensor,
        },
        {
          ...mockSensorData,
          _id: "507f1f77bcf86cd799439017",
          sensor: null,
        },
      ];

      const populateSecond = vi.fn().mockResolvedValue(populatedData);
      const populateFirst = vi.fn().mockReturnValue({
        populate: populateSecond,
      });

      vi.spyOn(SensorData, "find").mockReturnValue({
        populate: populateFirst,
      } as any);

      const result = await SensorDataService.getAll(companyUser as any);

      expect(result).toEqual([populatedData[0]]);
    });

    it("deve retornar uma lista vazia quando nenhum dado for encontrado", async () => {
      const populateSecond = vi.fn().mockResolvedValue([]);
      const populateFirst = vi.fn().mockReturnValue({
        populate: populateSecond,
      });

      vi.spyOn(SensorData, "find").mockReturnValue({
        populate: populateFirst,
      } as any);

      const result = await SensorDataService.getAll(companyUser as any);

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("deve criar um dado de sensor com sucesso", async () => {
      const save = vi
        .spyOn(SensorData.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await SensorDataService.create(
        companyUser as any,
        sensorDataInput,
      );

      expect(save).toHaveBeenCalled();
      expect(result).toBeDefined();

      expect(result.temperature).toBe(sensorDataInput.temperature);

      expect(result.soilHumidity).toBe(sensorDataInput.soilHumidity);

      expect(result.airHumidity).toBe(sensorDataInput.airHumidity);
    });

    it("deve criar um dado de sensor para agricultor familiar", async () => {
      const save = vi
        .spyOn(SensorData.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await SensorDataService.create(
        farmerUser as any,
        sensorDataInput,
      );

      expect(save).toHaveBeenCalled();
      expect(result).toBeDefined();

      expect(result.temperature).toBe(sensorDataInput.temperature);
    });
  });

  describe("update", () => {
    it("deve atualizar um dado de sensor com sucesso", async () => {
      const populatedSensorData = {
        ...mockSensorData,
        sensor: mockSensor,
        planting: mockPlanting,
      };

      const populatePlanting = vi.fn().mockResolvedValue(populatedSensorData);

      const populateSensor = vi.fn().mockReturnValue({
        populate: populatePlanting,
      });

      vi.spyOn(SensorData, "findById").mockReturnValue({
        populate: populateSensor,
      } as any);

      const findByIdAndUpdateSpy = vi
        .spyOn(SensorData, "findByIdAndUpdate")
        .mockResolvedValue(mockSensorData as any);

      const result = await SensorDataService.update(
        mockSensorData._id,
        companyUser as any,
        sensorDataInput,
      );

      expect(SensorData.findById).toHaveBeenCalledWith(mockSensorData._id);

      expect(populateSensor).toHaveBeenCalledWith("sensor");
      expect(populatePlanting).toHaveBeenCalledWith("planting");

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: mockSensor.user,
        company: mockSensor.company,
      });

      expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
        mockSensorData._id,
        sensorDataInput,
        { new: true },
      );

      expect(result).toEqual({
        success: true,
        sensorData: mockSensorData,
      });
    });

    it("deve retornar erro quando o dado de sensor não existe", async () => {
      const populatePlanting = vi.fn().mockResolvedValue(null);

      const populateSensor = vi.fn().mockReturnValue({
        populate: populatePlanting,
      });

      vi.spyOn(SensorData, "findById").mockReturnValue({
        populate: populateSensor,
      } as any);

      const findByIdAndUpdateSpy = vi.spyOn(SensorData, "findByIdAndUpdate");

      const result = await SensorDataService.update(
        mockSensorData._id,
        companyUser as any,
        sensorDataInput,
      );

      expect(result).toEqual({
        success: false,
        message: "Dado de sensor não encontrado",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
      expect(findByIdAndUpdateSpy).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deve deletar um dado de sensor com sucesso", async () => {
      const populatedSensorData = {
        ...mockSensorData,
        sensor: mockSensor,
        planting: mockPlanting,
      };

      const populatePlanting = vi.fn().mockResolvedValue(populatedSensorData);

      const populateSensor = vi.fn().mockReturnValue({
        populate: populatePlanting,
      });

      vi.spyOn(SensorData, "findById").mockReturnValue({
        populate: populateSensor,
      } as any);

      const deleteSpy = vi
        .spyOn(SensorData, "findByIdAndDelete")
        .mockResolvedValue(mockSensorData as any);

      const result = await SensorDataService.delete(
        mockSensorData._id,
        companyUser as any,
      );

      expect(SensorData.findById).toHaveBeenCalledWith(mockSensorData._id);

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: mockSensor.user,
        company: mockSensor.company,
      });

      expect(deleteSpy).toHaveBeenCalledWith(mockSensorData._id);

      expect(result).toEqual({
        success: true,
        message: "Dado de sensor deletado com sucesso.",
      });
    });

    it("deve retornar erro quando o dado de sensor não existe", async () => {
      const populatePlanting = vi.fn().mockResolvedValue(null);

      const populateSensor = vi.fn().mockReturnValue({
        populate: populatePlanting,
      });

      vi.spyOn(SensorData, "findById").mockReturnValue({
        populate: populateSensor,
      } as any);

      const deleteSpy = vi.spyOn(SensorData, "findByIdAndDelete");

      const result = await SensorDataService.delete(
        mockSensorData._id,
        companyUser as any,
      );

      expect(result).toEqual({
        success: false,
        message: "Dado de sensor não encontrado",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe("getOne", () => {
    it("deve retornar um dado de sensor com sucesso", async () => {
      const populatedSensorData = {
        ...mockSensorData,
        sensor: mockSensor,
        planting: mockPlanting,
      };

      const populatePlanting = vi.fn().mockResolvedValue(populatedSensorData);

      const populateSensor = vi.fn().mockReturnValue({
        populate: populatePlanting,
      });

      vi.spyOn(SensorData, "findById").mockReturnValue({
        populate: populateSensor,
      } as any);

      const result = await SensorDataService.getOne(
        mockSensorData._id,
        companyUser as any,
      );

      expect(SensorData.findById).toHaveBeenCalledWith(mockSensorData._id);

      expect(populateSensor).toHaveBeenCalledWith("sensor");
      expect(populatePlanting).toHaveBeenCalledWith("planting");

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: mockSensor.user,
        company: mockSensor.company,
      });

      expect(result).toEqual({
        success: true,
        sensorData: populatedSensorData,
      });
    });

    it("deve retornar erro quando o dado de sensor não existe", async () => {
      const populatePlanting = vi.fn().mockResolvedValue(null);

      const populateSensor = vi.fn().mockReturnValue({
        populate: populatePlanting,
      });

      vi.spyOn(SensorData, "findById").mockReturnValue({
        populate: populateSensor,
      } as any);

      const result = await SensorDataService.getOne(
        mockSensorData._id,
        companyUser as any,
      );

      expect(result).toEqual({
        success: false,
        message: "Dado de sensor não encontrado",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
    });
  });
});
