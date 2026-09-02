import mongoose, { Schema, Model } from "mongoose";

import { IHarvest } from "./harvests.types";

const HarvestSchema: Schema<IHarvest> = new Schema(
  {
    harvestedQuantity: { type: Number },
    quality: { type: Number },
    harvestDate: { type: Date },
    harvestStart: { type: String },
    harvestEnd: { type: String },
    harvestDuration: { type: String },
    planting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Planting",
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

const Harvest: Model<IHarvest> = mongoose.model<IHarvest>(
  "Harvest",
  HarvestSchema,
);

export default Harvest;