import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

// CONFIGURAÇÃO DO CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

const allowedFormats = ["jpg", "jpeg", "png", "webp"];

// CRIAR STORAGE PARA USUÁRIOS
const storageUsers = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const request = req as AuthenticatedRequest;
    return {
      folder: "mobo/users",
      resource_type: "image",
      public_id: `user-${Date.now()}-${crypto.randomUUID()}`,
      allowed_formats: allowedFormats,
      transformation: [
        {
          width: 500,
          height: 500,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
      overwrite: true,
      invalidate: true,
    };
  },
});

// CRIAR STORAGE PARA COLHEITAS
const storageHarvests = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const request = req as AuthenticatedRequest;
    return {
      folder: "mobo/harvests",
      public_id: `${request.user.id}-${Date.now()}`, // Garante unicidade usando ID do usuário + timestamp
      resource_type: "image",
      allowed_formats: allowedFormats,
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    };
  },
});

// CONFIGURAÇÃO DO MULTER PARA USUÁRIOS E COLHEITAS
export const uploadUsers = multer({
  storage: storageUsers,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
export const uploadHarvests = multer({
  storage: storageHarvests,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export { cloudinary };
