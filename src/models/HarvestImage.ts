import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { ICompany } from "./Company";

// INTERFACE PARA O DOCUMENTO DE IMAGEM DE COLHEITA
export interface IHarvestImage extends Document {
  user?: IUser["_id"];
  company?: ICompany["_id"];
  imageName: string;
  description?: string;
  createdAt: Date;
}

// SCHEMA PARA O DOCUMENTO DE IMAGEM DE COLHEITA
const HarvestImageSchema: Schema<IHarvestImage> = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  imageName: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// CRIANDO O MODELO DE IMAGEM DE COLHEITA
const HarvestImage: Model<IHarvestImage> = mongoose.model<IHarvestImage>(
  "HarvestImage",
  HarvestImageSchema,
);

export default HarvestImage;
