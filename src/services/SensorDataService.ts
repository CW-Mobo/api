import SensorData, { ISensorData } from "../models/SensorData";
import { IUserPayload } from "../utils/jwt";
import { checkOwnership } from "../utils/checkOwnership";

// INTERFACE PARA ENTRADA DE DADOS DE SENSOR
export interface SensorDataInput {
  temperature: number;
  soilHumidity: number;
  airHumidity: number;
  alerts?: ISensorData["alerts"];
  planting: ISensorData["planting"];
  sensor: ISensorData["sensor"];
}

interface SensorDataResult {
  success?: boolean;
  message?: string;
  sensorData?: ISensorData;
}

class SensorDataService {
  // LISTAR TODOS OS DADOS DE SENSOR (SEM PAGINAÇÃO)
  async getAll(userSession: IUserPayload): Promise<ISensorData[]> {
    const match =
      userSession.userRole === "family_farmer"
        ? { user: userSession.id }
        : { company: userSession.company! };

    const data = await SensorData.find()
      .populate({
        path: "sensor",
        match,
        select: "sensorType user company",
      })
      .populate("planting");

    return data.filter((d) => d.sensor !== null);
  }

  // CRIAR DADO DE SENSOR
  async create(
    userSession: IUserPayload,
    data: SensorDataInput,
  ): Promise<ISensorData> {
    const newSensorData = new SensorData(data);
    await newSensorData.save();
    return newSensorData;
  }

  // FUNÇÃO PARA ATUALIZAR UM DADO DE SENSOR
  async update(
    id: string,
    userSession: IUserPayload,
    data: SensorDataInput,
  ): Promise<SensorDataResult> {
    const sensorData = await SensorData.findById(id)
      .populate("sensor")
      .populate("planting");
    if (!sensorData)
      return { success: false, message: "Dado de sensor não encontrado" };

    const sensor = sensorData.sensor as { user?: string; company?: string };

    checkOwnership(userSession, {
      user: sensor?.user?.toString(),
      company: sensor?.company?.toString(),
    });
    const updatedSensorData = await SensorData.findByIdAndUpdate(id, data, {
      new: true,
    });
    return { success: true, sensorData: updatedSensorData! };
  }

  // FUNÇÃO PARA DELETAR UM DADO DE SENSOR
  async delete(
    id: string,
    userSession: IUserPayload,
  ): Promise<SensorDataResult> {
    const sensorData = await SensorData.findById(id)
      .populate("sensor")
      .populate("planting");
    if (!sensorData)
      return { success: false, message: "Dado de sensor não encontrado" };

    const sensor = sensorData.sensor as { user?: string; company?: string };

    checkOwnership(userSession, {
      user: sensor?.user?.toString(),
      company: sensor?.company?.toString(),
    });
    await SensorData.findByIdAndDelete(id);
    return { success: true, message: "Dado de sensor deletado com sucesso." };
  }

  // BUSCAR UM DADO DE SENSOR ESPECÍFICO
  async getOne(
    id: string,
    userSession: IUserPayload,
  ): Promise<SensorDataResult> {
    const sensorData = await SensorData.findById(id)
      .populate("sensor")
      .populate("planting");
    if (!sensorData)
      return { success: false, message: "Dado de sensor não encontrado" };

    const sensor = sensorData.sensor as { user?: string; company?: string };

    checkOwnership(userSession, {
      user: sensor?.user?.toString(),
      company: sensor?.company?.toString(),
    });
    return { success: true, sensorData };
  }
}

export default new SensorDataService();
