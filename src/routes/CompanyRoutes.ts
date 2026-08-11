import { Router } from "express";
import CompanyController from "../controllers/CompanyController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateObjectId } from "../middlewares/validateObjectId";

const router = Router();

router.use(authMiddleware); // Todas as rotas abaixo precisam de token
router.use("/:id", validateObjectId); // Todas as rotas com ID passam pela validação do ObjectId

router.get("/", CompanyController.getAllCompanies);
router.post("/", CompanyController.createCompany);
router.put("/:id", CompanyController.updateCompany);
router.delete("/:id", CompanyController.deleteCompany);
router.get("/:id", CompanyController.getOneCompany);

export default router;
