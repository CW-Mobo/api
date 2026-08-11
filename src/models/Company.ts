import mongoose, { Schema, Document, Model } from "mongoose";

// INTERFACES
interface ISubscriptionPlan {
  maxUsers: number;
  isActive: boolean;
}

// INTERFACE PARA O ENDEREÇO DA EMPRESA
interface ICompanyAddress {
  state: string;
  city: string;
  zipCode?: string;
}

// INTERFACE PRINCIPAL DA EMPRESA
export interface ICompany extends Document {
  companyCNPJ: string;
  ownerName: string;
  companyName?: string;
  subscriptionPlan: ISubscriptionPlan;
  companyAddress?: ICompanyAddress;
  createdAt: Date;
  updatedAt: Date;
}

// SCHEMA PARA O PLANO DE ASSINATURA
const SubscriptionPlanSchema: Schema<ISubscriptionPlan> = new Schema({
  maxUsers: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
});

// SCHEMA PARA O ENDEREÇO DA EMPRESA
const CompanyAddressSchema: Schema<ICompanyAddress> = new Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String },
});

// SCHEMMA PRINCIPAL DA EMPRESA
const CompanySchema: Schema<ICompany> = new Schema(
  {
    companyCNPJ: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    companyName: { type: String },
    subscriptionPlan: { type: SubscriptionPlanSchema, default: {} },
    companyAddress: { type: CompanyAddressSchema, default: {} },
  },
  { timestamps: true },
);

// CRIANDO O MODELO DA EMPRESA
const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  CompanySchema,
);

export default Company;
