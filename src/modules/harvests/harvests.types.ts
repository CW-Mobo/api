import { Types } from "mongoose";

export interface IHarvest {
  _id?: Types.ObjectId;
  harvestedQuantity: number;
  quality: number;
  harvestDate: Date;
  harvestStart: string;
  harvestEnd: string;
  harvestDuration: string;
  planting: Types.ObjectId;
  user?: Types.ObjectId;
  company?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface HarvestInput {
  harvestedQuantity: number;
  quality: number;
  harvestDate: Date;
  harvestStart: Date;
  harvestEnd: Date;
  harvestDuration: number;
  planting: string;
}

export interface HarvestResult {
  success?: boolean;
  message?: string;
  harvest?: IHarvest;
}