import mongoose, { Schema, Model } from "mongoose";
import { ISensor, ISetting, SensorType } from "./sensors.types";

const SettingSchema: Schema<ISetting> = new Schema({
  temperatureLimit: {
    type: Number,
    required: function (this: ISensor) {
      return this.sensorType.includes("temperature");
    },
    validate: {
      validator: (v: number) => v >= -10 && v <= 50,
      message: "Limite de temperatura deve estar entre -10°C e 50°C",
    },
  },

  soilHumidityLimit: {
    type: Number,
    required: function (this: ISensor) {
      return this.sensorType.includes("soil_humidity");
    },
    validate: {
      validator: (v: number) => v >= 0 && v <= 100,
    },
  },

  airHumidityLimit: {
    type: Number,
    required: function (this: ISensor) {
      return this.sensorType.includes("air_humidity");
    },
  },
});

const SensorSchema: Schema<ISensor> = new Schema(
  {
    sensorType: {
      type: [String],
      enum: [
        "air_humidity",
        "soil_humidity",
        "temperature",
      ] satisfies SensorType[],
      required: true,
    },

    sensorNumeration: {
      type: String,
    },

    sensorAccuracy: {
      type: Number,
    },

    measuringRange: {
      type: String,
    },

    setting: {
      type: SettingSchema,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true },
);

const Sensor: Model<ISensor> = mongoose.model<ISensor>("Sensor", SensorSchema);

export default Sensor;
