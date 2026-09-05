import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Response, NextFunction } from "express";
import SensorController from "../../../src/modules/sensors/sensors.controller";
import SensorService from "../../../src/modules/sensors/sensors.service";

vi.mock("../../../src/modules/sensors/sensors.service", () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getOne: vi.fn(),
  },
}));

describe("SensorController", () => {
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

  const sensorData = {
    sensorType: "temperature",
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
    company: user.company,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
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

  describe("getAllSensors", () => {
    it("deve retornar todos os sensores com sucesso", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.getAll).mockResolvedValue([mockSensor] as any);

      await SensorController.getAllSensors(req as any, res, next);

      expect(SensorService.getAll).toHaveBeenCalledWith(user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        sensors: [mockSensor],
      });
    });

    it("deve retornar erro quando não houver sensores", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.getAll).mockResolvedValue(undefined as any);

      await SensorController.getAllSensors(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nenhum sensor encontrado.",
      });
    });
  });

  describe("createSensor", () => {
    it("deve criar um sensor com sucesso", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.create).mockResolvedValue(mockSensor as any);

      const createReq = {
        ...req,
        body: sensorData,
      };

      await SensorController.createSensor(createReq as any, res, next);

      expect(SensorService.create).toHaveBeenCalledWith(user, sensorData);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sensor cadastrado com sucesso.",
        newSensor: mockSensor,
      });
    });

    it("deve retornar erro quando o sensor não puder ser criado", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.create).mockResolvedValue(undefined as any);

      const createReq = {
        ...req,
        body: sensorData,
      };

      await SensorController.createSensor(createReq as any, res, next);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível cadastrar o sensor.",
      });
    });
  });

  describe("updateSensor", () => {
    it("deve atualizar um sensor com sucesso", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.update).mockResolvedValue({
        success: true,
        message: "Sensor atualizado com sucesso",
        sensor: mockSensor,
      } as any);

      const updateReq = {
        ...req,
        params: {
          id: mockSensor._id,
        },
        body: sensorData,
      };

      await SensorController.updateSensor(updateReq as any, res, next);

      expect(SensorService.update).toHaveBeenCalledWith(
        mockSensor._id,
        user,
        sensorData,
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sensor atualizado com sucesso.",
        updatedSensor: {
          success: true,
          message: "Sensor atualizado com sucesso",
          sensor: mockSensor,
        },
      });
    });

    it("deve retornar erro quando o sensor não existir", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.update).mockResolvedValue(undefined as any);

      const updateReq = {
        ...req,
        params: {
          id: mockSensor._id,
        },
        body: sensorData,
      };

      await SensorController.updateSensor(updateReq as any, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sensor não encontrado ou não pôde ser atualizado.",
      });
    });
  });

  describe("deleteSensor", () => {
    it("deve deletar um sensor com sucesso", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.delete).mockResolvedValue({
        success: true,
        message: "Sensor deletado com sucesso",
      });

      const deleteReq = {
        ...req,
        params: {
          id: mockSensor._id,
        },
      };

      await SensorController.deleteSensor(deleteReq as any, res, next);

      expect(SensorService.delete).toHaveBeenCalledWith(mockSensor._id, user);

      expect(res.status).toHaveBeenCalledWith(204);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sensor deletado com sucesso.",
      });
    });
  });

  describe("getOneSensor", () => {
    it("deve retornar um sensor com sucesso", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.getOne).mockResolvedValue({
        success: true,
        sensor: mockSensor,
      } as any);

      const getReq = {
        ...req,
        params: {
          id: mockSensor._id,
        },
      };

      await SensorController.getOneSensor(getReq as any, res, next);

      expect(SensorService.getOne).toHaveBeenCalledWith(mockSensor._id, user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        sensor: {
          success: true,
          sensor: mockSensor,
        },
      });
    });

    it("deve retornar erro quando o sensor não existir", async () => {
      const res = createResponseMock();

      vi.mocked(SensorService.getOne).mockResolvedValue(undefined as any);

      const getReq = {
        ...req,
        params: {
          id: mockSensor._id,
        },
      };

      await SensorController.getOneSensor(getReq as any, res, next);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sensor não encontrado.",
      });
    });
  });
});
