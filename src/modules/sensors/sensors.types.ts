import { Types } from "mongoose";

export type SensorType = "air_humidity" | "soil_humidity" | "temperature";

export interface ISetting {
  temperatureLimit?: number;
  soilHumidityLimit?: number;
  airHumidityLimit?: number;
}

export interface ISensor {
  _id?: Types.ObjectId;
  sensorType: SensorType[];
  sensorNumeration?: string;
  sensorAccuracy?: number;
  measuringRange?: string;
  setting?: ISetting;
  user?: Types.ObjectId;
  company?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorInput {
  sensorType: "air_humidity" | "soil_humidity" | "temperature";
  sensorNumeration: string;
  sensorAccuracy: number;
  measuringRange: string;
  setting: ISensor["setting"];
}

export interface SensorResult {
  success?: boolean;
  message?: string;
  sensor?: ISensor;
}
