import { Router } from "express";
import HarvestImageController from "./harvest-images.controller";
import { authMiddleware, ensureUser } from "../../middlewares/authMiddleware";
import { uploadHarvests } from "../../config/cloudinary";

const router = Router();

router.use(authMiddleware);
router.use(ensureUser);

router.get("/", HarvestImageController.getUserImages);
router.post(
  "/",
  uploadHarvests.single("image"),
  HarvestImageController.uploadImage,
);

export default router;
