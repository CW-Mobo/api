import { describe, it, expect, vi, beforeEach } from "vitest";
import SensorDataController from "../../../src/modules/sensor-data/sensor-data.controller";
import SensorDataService from "../../../src/modules/sensor-data/sensor-data.service";
import { NextFunction } from "express";
import { AuthRequest } from "../../../src/middlewares/authMiddleware";

describe("SensorDataController", () => {
  const user = {
    id: "user-id",
    userRole: "family_farmer",
    company: "company-id",
  } as any;

  const sensorData = {
    _id: "sensor-data-id",
    temperature: 25,
    soilHumidity: 60,
    airHumidity: 70,
    planting: "planting-id",
    sensor: "sensor-id",
  } as any;

  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;

  const next = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();

    response.status.mockReturnThis();
    response.json.mockReturnThis();
  });

  describe("getAllSensorDatas", () => {
    it("deve retornar todos os dados de sensor", async () => {
      vi.spyOn(SensorDataService, "getAll").mockResolvedValue([sensorData]);

      const request = {
        user,
      } as AuthRequest;

      await SensorDataController.getAllSensorDatas(request, response, next);

      expect(SensorDataService.getAll).toHaveBeenCalledWith(user);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        sensorDatas: [sensorData],
      });
    });

    it("deve retornar 404 quando nenhum dado de sensor for encontrado", async () => {
      vi.spyOn(SensorDataService, "getAll").mockResolvedValue([]);

      const request = {
        user,
      } as AuthRequest;

      await SensorDataController.getAllSensorDatas(request, response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        sensorDatas: [],
      });
    });
  });

  describe("createSensorData", () => {
    it("deve criar um novo dado de sensor", async () => {
      const sensorDataInput = {
        temperature: 25,
        soilHumidity: 60,
        airHumidity: 70,
        planting: "planting-id",
        sensor: "sensor-id",
      };

      vi.spyOn(SensorDataService, "create").mockResolvedValue(sensorData);

      const request = {
        user,
        body: sensorDataInput,
      } as AuthRequest;

      await SensorDataController.createSensorData(request, response, next);

      expect(SensorDataService.create).toHaveBeenCalledWith(
        user,
        sensorDataInput,
      );

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: "Dado de Sensor cadastrado com sucesso.",
        newSensorData: sensorData,
      });
    });

    it("deve retornar 400 quando não for possível criar o dado de sensor", async () => {
      vi.spyOn(SensorDataService, "create").mockResolvedValue(undefined as any);

      const request = {
        user,
        body: {},
      } as AuthRequest;

      await SensorDataController.createSensorData(request, response, next);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível cadastrar o Dado do Sensor.",
      });
    });
  });

  describe("updateSensorData", () => {
    it("deve atualizar um dado de sensor", async () => {
      const sensorDataInput = {
        temperature: 28,
        soilHumidity: 65,
        airHumidity: 75,
        planting: "planting-id",
        sensor: "sensor-id",
      };

      const updatedSensorData = {
        success: true,
        sensorData,
      };

      vi.spyOn(SensorDataService, "update").mockResolvedValue(
        updatedSensorData,
      );

      const request = {
        user,
        params: {
          id: "sensor-data-id",
        },
        body: sensorDataInput,
      } as unknown as AuthRequest;

      await SensorDataController.updateSensorData(request, response, next);

      expect(SensorDataService.update).toHaveBeenCalledWith(
        "sensor-data-id",
        user,
        sensorDataInput,
      );

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: "Dado de Sensor atualizado com sucesso.",
        updatedSensorData,
      });
    });

    it("deve retornar 404 quando o dado de sensor não for encontrado ou não puder ser atualizado", async () => {
      vi.spyOn(SensorDataService, "update").mockResolvedValue(undefined as any);

      const request = {
        user,
        params: {
          id: "sensor-data-id",
        },
        body: {},
      } as unknown as AuthRequest;

      await SensorDataController.updateSensorData(request, response, next);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: "Dado de Sensor não encontrado ou não pôde ser atualizado.",
      });
    });
  });

  describe("deleteSensorData", () => {
    it("deve deletar um dado de sensor", async () => {
      vi.spyOn(SensorDataService, "delete").mockResolvedValue({
        success: true,
        message: "Dado de sensor deletado com sucesso.",
      });

      const request = {
        user,
        params: {
          id: "sensor-data-id",
        },
      } as unknown as AuthRequest;

      await SensorDataController.deleteSensorData(request, response, next);

      expect(SensorDataService.delete).toHaveBeenCalledWith(
        "sensor-data-id",
        user,
      );

      expect(response.status).toHaveBeenCalledWith(204);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: "Dado de Sensor deletado com sucesso.",
      });
    });
  });

  describe("getOneSensorData", () => {
    it("deve retornar um dado de sensor específico", async () => {
      const result = {
        success: true,
        sensorData,
      };

      vi.spyOn(SensorDataService, "getOne").mockResolvedValue(result);

      const request = {
        user,
        params: {
          id: "sensor-data-id",
        },
      } as unknown as AuthRequest;

      await SensorDataController.getOneSensorData(request, response, next);

      expect(SensorDataService.getOne).toHaveBeenCalledWith(
        "sensor-data-id",
        user,
      );

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        sensorData: result,
      });
    });

    it("deve retornar 404 quando o dado de sensor não for encontrado", async () => {
      vi.spyOn(SensorDataService, "getOne").mockResolvedValue(undefined as any);

      const request = {
        user,
        params: {
          id: "sensor-data-id",
        },
      } as unknown as AuthRequest;

      await SensorDataController.getOneSensorData(request, response, next);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: "Dado de Sensor não encontrado.",
      });
    });
  });
});
