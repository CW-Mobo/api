import mongoose, { Schema, Document, Model } from "mongoose";
import { IPlanting } from "./Planting";
import { IUser } from "./User";
import { ICompany } from "./Company";

// INTERFACE PARA O DOCUMENTO DE COLHEITA
export interface IHarvest extends Document {
  harvestedQuantity: number;
  quality: number;
  harvestDate: Date;
  harvestStart: string;
  harvestEnd: string;
  harvestDuration: string;
  planting: IPlanting["_id"];
  user?: IUser["_id"];
  company?: ICompany["_id"];
  createdAt: Date;
  updatedAt: Date;
}

// SCHEMA PARA O DOCUMENTO DE COLHEITA
const HarvestSchema: Schema<IHarvest> = new Schema(
  {
    harvestedQuantity: { type: Number },
    quality: { type: Number },
    harvestDate: { type: Date },
    harvestStart: { type: String },
    harvestEnd: { type: String },
    harvestDuration: { type: String },
    planting: { type: mongoose.Schema.Types.ObjectId, ref: "Planting" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { timestamps: true },
);

// CRIANDO O MODELO DE COLHEITA
const Harvest: Model<IHarvest> = mongoose.model<IHarvest>(
  "Harvest",
  HarvestSchema,
);

export default Harvest;
