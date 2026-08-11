import Sensor, { ISensor } from "../models/Sensor";
import { IUserPayload } from "../utils/jwt";
import {
  checkOwnership,
  ownedFields,
  assignOwnership,
} from "../utils/checkOwnership";

// INTERFACE PARA ENTRADA DE DADOS DE SENSOR
export interface SensorInput {
  sensorType: "air_humidity" | "soil_humidity" | "temperature";
  sensorNumeration: string;
  sensorAccuracy: number;
  measuringRange: string;
  setting: ISensor["setting"];
}

// INTERFACE PARA RESULTADOS DE SENSOR
interface SensorResult {
  success?: boolean;
  message?: string;
  sensor?: ISensor;
}

class SensorService {
  // LISTA TODOS OS SENSORES (SEM PAGINAÇÃO)
  async getAll(userSession: IUserPayload): Promise<ISensor[]> {
    const filter =
      userSession.userRole === "family_farmer"
        ? { user: userSession.id }
        : { company: userSession.company! };
    return await Sensor.find(filter);
  }

  // CRIAR SENSOR
  async create(userSession: IUserPayload, data: SensorInput): Promise<ISensor> {
    const newSensor = new Sensor(data);
    assignOwnership(userSession, newSensor);
    await newSensor.save();
    return newSensor;
  }

  // ATUALIZAR SENSOR
  async update(
    id: string,
    userSession: IUserPayload,
    data: SensorInput,
  ): Promise<SensorResult> {
    const sensor = await Sensor.findById(id);
    if (!sensor) return { success: false, message: "Sensor não encontrado" };
    checkOwnership(userSession, ownedFields(sensor));
    const updatedSensor = await Sensor.findByIdAndUpdate(id, data, {
      new: true,
    });
    return {
      success: true,
      message: "Sensor atualizado com sucesso",
      sensor: updatedSensor!,
    };
  }

  // DELETAR SENSOR
  async delete(id: string, userSession: IUserPayload): Promise<SensorResult> {
    const sensor = await Sensor.findById(id);
    if (!sensor) return { success: false, message: "Sensor não encontrado" };
    checkOwnership(userSession, ownedFields(sensor));
    await Sensor.findByIdAndDelete(id);
    return { success: true, message: "Sensor deletado com sucesso" };
  }

  // BUSCAR SENSOR ESPECÍFICO
  async getOne(id: string, userSession: IUserPayload): Promise<SensorResult> {
    const sensor = await Sensor.findById(id);
    if (!sensor) return { success: false, message: "Sensor não encontrado" };
    checkOwnership(userSession, ownedFields(sensor));
    return { success: true, sensor };
  }
}

export default new SensorService();
