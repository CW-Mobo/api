import { Router } from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateObjectId } from "../middlewares/validateObjectId";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token

router.get("/", UserController.getAllUsers);
router.get("/me", UserController.getUser);
// Não possui o create pois está no AuthRouters
router.put("/", UserController.updateUser);
router.delete("/:id", validateObjectId, UserController.deleteUser);

export default router;
