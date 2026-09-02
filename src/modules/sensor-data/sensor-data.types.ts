import { Types } from "mongoose";

export type SensorAlertType =
  | "high_temp"
  | "low_temp"
  | "high_humidity"
  | "low_humidity";

export interface ISensorAlert {
  type: SensorAlertType;
  value: number;
  threshold: number;
  timestamp: Date;
  isActive: boolean;
}

export interface ISensorData {
  _id?: Types.ObjectId;
  temperature?: number;
  soilHumidity?: number;
  airHumidity?: number;
  alerts?: ISensorAlert[];
  planting: Types.ObjectId;
  sensor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorDataInput {
  temperature: number;
  soilHumidity: number;
  airHumidity: number;
  alerts?: ISensorData["alerts"];
  planting: ISensorData["planting"];
  sensor: ISensorData["sensor"];
}

export interface SensorDataResult {
  success?: boolean;
  message?: string;
  sensorData?: ISensorData;
}