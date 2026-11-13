import { Router } from "express";
import multer from "multer";
import { authMiddleware, ensureUser } from "../../middlewares/authMiddleware";
import AIController from "./ai.controller";

const router = Router();
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    const error = new Error("Envie uma imagem JPG, JPEG ou PNG.") as Error & {
      statusCode: number;
    };
    error.statusCode = 400;
    callback(error);
  },
});

router.use(authMiddleware, ensureUser);
router.post("/predict", imageUpload.single("file"), AIController.analyzeImage);
router.post("/predict-frame", AIController.analyzeFrame);

export default router;
