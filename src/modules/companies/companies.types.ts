import { Types } from "mongoose";

export interface ISubscriptionPlan {
  maxUsers: number;
  isActive: boolean;
}

export interface ICompanyAddress {
  state: string;
  city: string;
  zipCode?: string;
}

export interface ICompany {
  _id?: Types.ObjectId;
  companyCNPJ: string;
  ownerName: string;
  companyName?: string;
  subscriptionPlan: ISubscriptionPlan;
  companyAddress?: ICompanyAddress;
  createdAt: Date;
  updatedAt: Date;
}
