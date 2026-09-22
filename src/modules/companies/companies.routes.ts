import { Router } from "express";
import CompanyController from "./companies.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateObjectId } from "../../middlewares/validateObjectId";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     description: Returns all registered companies.
 *     tags:
 *       - Companies
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Companies retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 companies:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Company"
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: No companies found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

router.get("/", CompanyController.getAllCompanies);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company
 *     description: Creates a new company.
 *     tags:
 *       - Companies
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CompanyInput"
 *     responses:
 *       201:
 *         description: Company created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Empresa criada com sucesso."
 *                 newCompany:
 *                   $ref: "#/components/schemas/Company"
 *       400:
 *         description: Invalid data, invalid CNPJ, duplicated CNPJ, or company could not be created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Authentication required.
 */

router.post("/", CompanyController.createCompany);

router.use("/:id", validateObjectId);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update a company
 *     description: Updates an existing company.
 *     tags:
 *       - Companies
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the company.
 *         schema:
 *           type: string
 *           example: "68c1a2b3c4d5e6f789012345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CompanyInput"
 *     responses:
 *       200:
 *         description: Company updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Empresa atualizada com sucesso."
 *                 updatedCompany:
 *                   $ref: "#/components/schemas/Company"
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Company not found or could not be updated.
 */

router.put("/:id", CompanyController.updateCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     description: Deletes an existing company.
 *     tags:
 *       - Companies
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the company.
 *         schema:
 *           type: string
 *           example: "68c1a2b3c4d5e6f789012345"
 *     responses:
 *       200:
 *         description: Company deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Empresa deletada com sucesso."
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Company not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

router.delete("/:id", CompanyController.deleteCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a company
 *     description: Returns a company by its ID.
 *     tags:
 *       - Companies
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the company.
 *         schema:
 *           type: string
 *           example: "68c1a2b3c4d5e6f789012345"
 *     responses:
 *       200:
 *         description: Company retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 company:
 *                   $ref: "#/components/schemas/Company"
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Company not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */

router.get("/:id", CompanyController.getOneCompany);

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyInput:
 *       type: object
 *       required:
 *         - companyCNPJ
 *         - ownerName
 *         - companyName
 *       properties:
 *         companyCNPJ:
 *           type: string
 *           description: Company CNPJ. Non-digit characters are removed before validation.
 *           example: "12345678000190"
 *         ownerName:
 *           type: string
 *           description: Name of the company owner.
 *           example: "João da Silva"
 *         companyName:
 *           type: string
 *           description: Name of the company.
 *           example: "Mobo Farm"
 *         subscriptionPlan:
 *           $ref: "#/components/schemas/SubscriptionPlan"
 *         companyAddress:
 *           $ref: "#/components/schemas/CompanyAddress"
 *
 *     Company:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the company.
 *           example: "68c1a2b3c4d5e6f789012345"
 *         companyCNPJ:
 *           type: string
 *           example: "12345678000190"
 *         ownerName:
 *           type: string
 *           example: "João da Silva"
 *         companyName:
 *           type: string
 *           example: "Mobo Farm"
 *         subscriptionPlan:
 *           $ref: "#/components/schemas/SubscriptionPlan"
 *         companyAddress:
 *           $ref: "#/components/schemas/CompanyAddress"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-09-21T18:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-09-21T19:15:00.000Z"
 *
 *     SubscriptionPlan:
 *       type: object
 *       required:
 *         - maxUsers
 *         - isActive
 *       properties:
 *         maxUsers:
 *           type: integer
 *           description: Maximum number of users allowed by the subscription plan.
 *           example: 10
 *         isActive:
 *           type: boolean
 *           description: Indicates whether the subscription plan is active.
 *           example: true
 *
 *     CompanyAddress:
 *       type: object
 *       required:
 *         - state
 *         - city
 *       properties:
 *         state:
 *           type: string
 *           example: "São Paulo"
 *         city:
 *           type: string
 *           example: "Sorocaba"
 *         zipCode:
 *           type: string
 *           example: "18000-000"
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Empresa não encontrada."
 */

export default router;
