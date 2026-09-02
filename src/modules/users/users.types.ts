import { Types } from "mongoose";

export interface IFarmerDetails {
  cpf: string;
  dap: string;
}

export type UserRole =
  | "family_farmer"
  | "company_admin"
  | "company_worker";

export interface IUser {
  _id?: Types.ObjectId;
  userImage?: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhone?: string;
  userRole: UserRole;
  company?: Types.ObjectId;
  farmerDetails?: IFarmerDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhone?: string;
  userRole: UserRole;
  company?: string;
  farmerDetails?: IFarmerDetails;
  userImage?: string;
}

export interface UserResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    userImage?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userRole: string;
    company?: string;
    farmerDetails?: IFarmerDetails;
  };
}