import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { ICompany } from "./Company";

// INTERFACE PARA CONFIGURAÇÕES DO SENSOR
interface ISetting {
  temperatureLimit?: number;
  soilHumidityLimit?: number;
  airHumidityLimit?: number;
}

// INTERFACE PRINCIPAL DO DOCUMENTO SENSOR
export interface ISensor extends Document {
  sensorType: ("air_humidity" | "soil_humidity" | "temperature")[];
  sensorNumeration?: string;
  sensorAccuracy?: number;
  measuringRange?: string;
  setting?: ISetting;
  user?: IUser["_id"];
  company?: ICompany["_id"];
  createdAt: Date;
  updatedAt: Date;
}

// SCHEMA PARA CONFIGURAÇÕES DO SENSOR
const SettingSchema: Schema<ISetting> = new Schema({
  temperatureLimit: {
    type: Number,
    required: function (this: ISensor) {
      return this.sensorType.includes("temperature");
    },
    validate: {
      validator: function (v: number) {
        return v >= -10 && v <= 50;
      },
      message: "Limite de temperatura deve estar entre -10°C e 50°C",
    },
  },
  soilHumidityLimit: {
    type: Number,
    required: function (this: ISensor) {
      return this.sensorType.includes("soil_humidity");
    },
    validate: {
      validator: function (v: number) {
        return v >= 0 && v <= 100;
      },
    },
  },
  airHumidityLimit: {
    type: Number,
    required: function (this: ISensor) {
      return this.sensorType.includes("air_humidity");
    },
  },
});

// SCHEMA PRINCIPAL DO SENSOR
const SensorSchema: Schema<ISensor> = new Schema(
  {
    sensorType: {
      type: [String],
      enum: ["air_humidity", "soil_humidity", "temperature"],
      required: true,
    },
    sensorNumeration: { type: String },
    sensorAccuracy: { type: Number },
    measuringRange: { type: String },
    setting: { type: SettingSchema },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { timestamps: true },
);

// CRIAÇÃO DO MODELO DE SENSOR
const Sensor: Model<ISensor> = mongoose.model<ISensor>("Sensor", SensorSchema);

export default Sensor;
