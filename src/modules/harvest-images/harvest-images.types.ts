import { Types } from "mongoose";

export interface IHarvestImage {
  _id?: Types.ObjectId;
  user?: Types.ObjectId;
  company?: Types.ObjectId;
  imageName: string;
  description?: string;
  createdAt: Date;
}

export interface UploadImageResult {
  success: boolean;
  image?: IHarvestImage;
  message?: string;
}