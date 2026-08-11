import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { ICompany } from "./Company";

// INTERFACE PARA O DOCUMENTO DE PLANTAÇÃO
interface ILocation {
  longitude: number;
  latitude: number;
}

// INTERFACE PARA O DOCUMENTO DE PLANTAÇÃO
export interface IPlanting extends Document {
  plantingName: string;
  plantingDate?: Date;
  plantedArea: number;
  location: ILocation;
  user?: IUser["_id"];
  company?: ICompany["_id"];
  createdAt: Date;
  updatedAt: Date;
}

// SCHEMA PARA A LOCALIZAÇÃO
const LocationSchema: Schema<ILocation> = new Schema({
  longitude: { type: Number },
  latitude: { type: Number },
});

// SCHEMA PARA A PLANTAÇÃO
const PlantingSchema: Schema<IPlanting> = new Schema(
  {
    plantingName: { type: String },
    plantingDate: { type: Date },
    plantedArea: { type: Number },
    location: { type: LocationSchema },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { timestamps: true },
);

// CRIAÇÃO DO MODELO DE PLANTAÇÃO
const Planting: Model<IPlanting> = mongoose.model<IPlanting>(
  "Planting",
  PlantingSchema,
);

export default Planting;
