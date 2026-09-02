import mongoose, { Schema, Model } from "mongoose";

import {
  ISensorData,
  ISensorAlert,
  SensorAlertType,
} from "./sensor-data.types";

const SensorAlertsSchema: Schema<ISensorAlert> = new Schema({
  type: {
    type: String,
    enum: [
      "high_temp",
      "low_temp",
      "high_humidity",
      "low_humidity",
    ] satisfies SensorAlertType[],
  },

  value: {
    type: Number,
  },

  threshold: {
    type: Number,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

const SensorDataSchema: Schema<ISensorData> = new Schema(
  {
    temperature: {
      type: Number,
    },

    soilHumidity: {
      type: Number,
    },

    airHumidity: {
      type: Number,
    },

    alerts: {
      type: [SensorAlertsSchema],
      default: [],
    },

    planting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Planting",
      required: true,
    },

    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sensor",
      required: true,
    },
  },
  { timestamps: true },
);

const SensorData: Model<ISensorData> = mongoose.model<ISensorData>(
  "SensorData",
  SensorDataSchema,
);

export default SensorData;