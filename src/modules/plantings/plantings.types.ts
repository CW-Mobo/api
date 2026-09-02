import { Types } from "mongoose";

export interface ILocation {
  longitude: number;
  latitude: number;
}

export interface IPlanting {
  _id?: Types.ObjectId;
  plantingName: string;
  plantingDate?: Date;
  plantedArea: number;
  location: ILocation;
  user?: Types.ObjectId;
  company?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantingInput {
  plantingName: string;
  plantingDate: Date;
  plantedArea: number;
  location: ILocation;
}

export interface PlantingResult {
  success?: boolean;
  message?: string;
  planting?: IPlanting;
}