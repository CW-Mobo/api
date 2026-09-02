import mongoose, { Schema, Model } from "mongoose";

import { IHarvestImage } from "./harvest-images.types";

const HarvestImageSchema: Schema<IHarvestImage> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  imageName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HarvestImage: Model<IHarvestImage> = mongoose.model<IHarvestImage>(
  "HarvestImage",
  HarvestImageSchema,
);

export default HarvestImage;