import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Sensor from "../../../src/modules/sensors/sensors.model";
import SensorService from "../../../src/modules/sensors/sensors.service";
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

describe("SensorService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.mocked(checkOwnership).mockReturnValue(undefined);

    vi.mocked(ownedFields).mockReturnValue({
      user: undefined,
      company: undefined,
    });

    vi.mocked(assignOwnership).mockImplementation(() => undefined);
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

  const sensorData = {
    sensorType: "temperature" as const,
    sensorNumeration: "SENSOR-01",
    sensorAccuracy: 0.5,
    measuringRange: "-10°C a 50°C",
    setting: {
      temperatureLimit: 30,
    },
  };

  const mockSensor = {
    _id: "507f1f77bcf86cd799439014",
    sensorType: ["temperature"],
    sensorNumeration: "SENSOR-01",
    sensorAccuracy: 0.5,
    measuringRange: "-10°C a 50°C",
    setting: {
      temperatureLimit: 30,
    },
    company: companyUser.company,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  };

  describe("getAll", () => {
    it("deve retornar todos os sensores da empresa", async () => {
      vi.spyOn(Sensor, "find").mockResolvedValue([mockSensor] as any);

      const result = await SensorService.getAll(companyUser as any);

      expect(Sensor.find).toHaveBeenCalledWith({
        company: companyUser.company,
      });

      expect(result).toEqual([mockSensor]);
    });

    it("deve usar o usuário como filtro para agricultor familiar", async () => {
      vi.spyOn(Sensor, "find").mockResolvedValue([mockSensor] as any);

      const result = await SensorService.getAll(farmerUser as any);

      expect(Sensor.find).toHaveBeenCalledWith({
        user: farmerUser.id,
      });

      expect(result).toEqual([mockSensor]);
    });

    it("deve retornar uma lista vazia quando nenhum sensor for encontrado", async () => {
      vi.spyOn(Sensor, "find").mockResolvedValue([]);

      const result = await SensorService.getAll(companyUser as any);

      expect(Sensor.find).toHaveBeenCalledWith({
        company: companyUser.company,
      });

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("deve criar um sensor com sucesso", async () => {
      const save = vi
        .spyOn(Sensor.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await SensorService.create(companyUser as any, sensorData);

      expect(assignOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );

      expect(save).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result.sensorType).toEqual([sensorData.sensorType]);
      expect(result.sensorNumeration).toBe(sensorData.sensorNumeration);
      expect(result.sensorAccuracy).toBe(sensorData.sensorAccuracy);
      expect(result.measuringRange).toBe(sensorData.measuringRange);
    });

    it("deve atribuir a propriedade de empresa ao sensor", async () => {
      const save = vi
        .spyOn(Sensor.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await SensorService.create(companyUser as any, sensorData);

      expect(assignOwnership).toHaveBeenCalledWith(
        companyUser,
        expect.any(Object),
      );

      expect(result).toBeDefined();
      expect(save).toHaveBeenCalled();
    });

    it("deve criar sensor para agricultor familiar", async () => {
      const save = vi
        .spyOn(Sensor.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await SensorService.create(farmerUser as any, sensorData);

      expect(assignOwnership).toHaveBeenCalledWith(
        farmerUser,
        expect.any(Object),
      );

      expect(save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("deve atualizar um sensor com sucesso", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(mockSensor as any);

      vi.spyOn(Sensor, "findByIdAndUpdate").mockResolvedValue(
        mockSensor as any,
      );

      vi.mocked(ownedFields).mockReturnValue({
        user: undefined,
        company: companyUser.company,
      });

      const result = await SensorService.update(
        mockSensor._id,
        companyUser as any,
        sensorData,
      );

      expect(Sensor.findById).toHaveBeenCalledWith(mockSensor._id);

      expect(ownedFields).toHaveBeenCalledWith(mockSensor);

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });

      expect(Sensor.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSensor._id,
        sensorData,
        { new: true },
      );

      expect(result).toEqual({
        success: true,
        message: "Sensor atualizado com sucesso",
        sensor: mockSensor,
      });
    });

    it("deve retornar erro quando o sensor não existe", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(null);
      const findByIdAndUpdateSpy = vi.spyOn(Sensor, "findByIdAndUpdate");

      const result = await SensorService.update(
        "507f1f77bcf86cd799439014",
        companyUser as any,
        sensorData,
      );

      expect(result).toEqual({
        success: false,
        message: "Sensor não encontrado",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
      expect(findByIdAndUpdateSpy).not.toHaveBeenCalled();
    });

    it("deve verificar a propriedade do sensor antes de atualizar", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(mockSensor as any);

      vi.spyOn(Sensor, "findByIdAndUpdate").mockResolvedValue(
        mockSensor as any,
      );

      vi.mocked(ownedFields).mockReturnValue({
        user: undefined,
        company: companyUser.company,
      });

      await SensorService.update(
        mockSensor._id,
        companyUser as any,
        sensorData,
      );

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });
    });
  });

  describe("delete", () => {
    it("deve deletar um sensor com sucesso", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(mockSensor as any);

      const deleteSpy = vi
        .spyOn(Sensor, "findByIdAndDelete")
        .mockResolvedValue(mockSensor as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: undefined,
        company: companyUser.company,
      });

      const result = await SensorService.delete(
        mockSensor._id,
        companyUser as any,
      );

      expect(Sensor.findById).toHaveBeenCalledWith(mockSensor._id);

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });

      expect(deleteSpy).toHaveBeenCalledWith(mockSensor._id);

      expect(result).toEqual({
        success: true,
        message: "Sensor deletado com sucesso",
      });
    });

    it("deve retornar erro quando o sensor não existe", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(null);
      const findByIdAndDeleteSpy = vi.spyOn(Sensor, "findByIdAndDelete");

      const result = await SensorService.delete(
        mockSensor._id,
        companyUser as any,
      );

      expect(result).toEqual({
        success: false,
        message: "Sensor não encontrado",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
      expect(findByIdAndDeleteSpy).not.toHaveBeenCalled();
    });
  });

  describe("getOne", () => {
    it("deve retornar um sensor com sucesso", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(mockSensor as any);

      vi.mocked(ownedFields).mockReturnValue({
        user: undefined,
        company: companyUser.company,
      });

      const result = await SensorService.getOne(
        mockSensor._id,
        companyUser as any,
      );

      expect(Sensor.findById).toHaveBeenCalledWith(mockSensor._id);

      expect(checkOwnership).toHaveBeenCalledWith(companyUser, {
        user: undefined,
        company: companyUser.company,
      });

      expect(result).toEqual({
        success: true,
        sensor: mockSensor,
      });
    });

    it("deve retornar erro quando o sensor não existe", async () => {
      vi.spyOn(Sensor, "findById").mockResolvedValue(null);

      const result = await SensorService.getOne(
        mockSensor._id,
        companyUser as any,
      );

      expect(result).toEqual({
        success: false,
        message: "Sensor não encontrado",
      });

      expect(checkOwnership).not.toHaveBeenCalled();
    });
  });
});
