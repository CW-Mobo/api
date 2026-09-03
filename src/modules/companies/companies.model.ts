import mongoose, { Schema, Model } from "mongoose";
import {
  ICompany,
  ISubscriptionPlan,
  ICompanyAddress,
} from "./companies.types";

const SubscriptionPlanSchema: Schema<ISubscriptionPlan> = new Schema({
  maxUsers: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
});

const CompanyAddressSchema: Schema<ICompanyAddress> = new Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String },
});

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

const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  CompanySchema,
);

export default Company;
