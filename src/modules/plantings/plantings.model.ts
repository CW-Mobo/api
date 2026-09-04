import mongoose, { Schema, Model } from "mongoose";
import { IPlanting, ILocation } from "./plantings.types";

const LocationSchema: Schema<ILocation> = new Schema(
  {
    longitude: { type: Number },
    latitude: { type: Number },
  },
  { _id: false },
);

const PlantingSchema: Schema<IPlanting> = new Schema(
  {
    plantingName: { type: String },
    plantingDate: { type: Date },
    plantedArea: { type: Number },
    location: { type: LocationSchema },
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

const Planting: Model<IPlanting> = mongoose.model<IPlanting>(
  "Planting",
  PlantingSchema,
);

export default Planting;
