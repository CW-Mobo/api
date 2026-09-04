import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

import CompanyController from "../../../src/modules/companies/companies.controller";
import CompanyService from "../../../src/modules/companies/companies.service";

describe("CompanyController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockResponse = () => {
    const res = {} as Response;

    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);

    return res;
  };
  const mockNext = () => vi.fn() as NextFunction;

  describe("getAllCompanies", () => {
    it("deve retornar todas as empresas", async () => {
      const companies = [
        {
          companyCNPJ: "12345678000199",
          ownerName: "João Silva",
          companyName: "Empresa 1",
        },
      ];

      vi.spyOn(CompanyService, "getAll").mockResolvedValue(companies as any);

      const req = {} as Request;
      const res = mockResponse();

      await CompanyController.getAllCompanies(req, res, mockNext());

      expect(CompanyService.getAll).toHaveBeenCalledOnce();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        companies,
      });
    });

    it("deve retornar 404 quando nenhuma empresa for encontrada", async () => {
      vi.spyOn(CompanyService, "getAll").mockResolvedValue([]);

      const req = {} as Request;
      const res = mockResponse();

      await CompanyController.getAllCompanies(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nenhuma empresa encontrada.",
      });
    });
  });

  describe("createCompany", () => {
    it("deve retornar 400 quando campos obrigatórios estiverem ausentes", async () => {
      const req = {
        body: {
          companyCNPJ: "12345678000199",
        },
      } as Request;

      const res = mockResponse();

      await CompanyController.createCompany(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Campos obrigatórios ausentes: CNPJ, nome da empresa ou responsável.",
      });

      const createMock = vi
        .spyOn(CompanyService, "create")
        .mockResolvedValue({} as any);

      await CompanyController.createCompany(req, res, mockNext());

      expect(createMock).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o CNPJ for inválido", async () => {
      const req = {
        body: {
          companyCNPJ: "123",
          ownerName: "João Silva",
          companyName: "Empresa Teste",
        },
      } as Request;

      const res = mockResponse();

      await CompanyController.createCompany(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "CNPJ inválido.",
      });

      const createMock = vi
        .spyOn(CompanyService, "create")
        .mockResolvedValue({} as any);

      await CompanyController.createCompany(req, res, mockNext());

      expect(createMock).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o CNPJ já estiver cadastrado", async () => {
      const existingCompany = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Existente",
      };

      vi.spyOn(CompanyService, "getByCNPJ").mockResolvedValue(
        existingCompany as any,
      );

      const req = {
        body: {
          companyCNPJ: "12.345.678/0001-99",
          ownerName: "Maria Silva",
          companyName: "Nova Empresa",
        },
      } as Request;

      const res = mockResponse();

      await CompanyController.createCompany(req, res, mockNext());

      expect(CompanyService.getByCNPJ).toHaveBeenCalledWith("12345678000199");

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "CNPJ já cadastrado.",
      });

      const createMock = vi
        .spyOn(CompanyService, "create")
        .mockResolvedValue({} as any);

      await CompanyController.createCompany(req, res, mockNext());

      expect(createMock).not.toHaveBeenCalled();
    });

    it("deve criar uma empresa com sucesso", async () => {
      const companyData = {
        companyCNPJ: "12.345.678/0001-99",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      const newCompany = {
        _id: "company-id",
        ...companyData,
      };

      vi.spyOn(CompanyService, "getByCNPJ").mockResolvedValue(null);

      vi.spyOn(CompanyService, "create").mockResolvedValue(newCompany as any);

      const req = {
        body: companyData,
      } as Request;

      const res = mockResponse();

      await CompanyController.createCompany(req, res, mockNext());

      expect(CompanyService.getByCNPJ).toHaveBeenCalledWith("12345678000199");

      expect(CompanyService.create).toHaveBeenCalledWith(companyData);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Empresa criada com sucesso.",
        newCompany,
      });
    });

    it("deve retornar 400 quando não for possível criar a empresa", async () => {
      const companyData = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      vi.spyOn(CompanyService, "getByCNPJ").mockResolvedValue(null);

      vi.spyOn(CompanyService, "create").mockResolvedValue(null as any);

      const req = {
        body: companyData,
      } as Request;

      const res = mockResponse();

      await CompanyController.createCompany(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Não foi possível criar a empresa.",
      });
    });
  });

  describe("updateCompany", () => {
    it("deve atualizar uma empresa com sucesso", async () => {
      const companyData = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Atualizada",
      };

      const updatedCompany = {
        _id: "company-id",
        ...companyData,
      };

      vi.spyOn(CompanyService, "update").mockResolvedValue(
        updatedCompany as any,
      );

      const req = {
        params: {
          id: "company-id",
        },
        body: companyData,
      } as unknown as Request;

      const res = mockResponse();

      await CompanyController.updateCompany(req, res, mockNext());

      expect(CompanyService.update).toHaveBeenCalledWith(
        "company-id",
        companyData,
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Empresa atualizada com sucesso.",
        updatedCompany,
      });
    });

    it("deve retornar 404 quando a empresa não for encontrada", async () => {
      const companyData = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Atualizada",
      };

      vi.spyOn(CompanyService, "update").mockResolvedValue(null);

      const req = {
        params: {
          id: "company-id",
        },
        body: companyData,
      } as unknown as Request;

      const res = mockResponse();

      await CompanyController.updateCompany(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Empresa não encontrada ou não pôde ser atualizada.",
      });
    });
  });

  describe("deleteCompany", () => {
    it("deve deletar uma empresa com sucesso", async () => {
      const company = {
        _id: "company-id",
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      vi.spyOn(CompanyService, "getOne").mockResolvedValue(company as any);

      const deleteMock = vi.spyOn(CompanyService, "delete").mockResolvedValue();

      const req = {
        params: {
          id: "company-id",
        },
      } as unknown as Request;

      const res = mockResponse();

      await CompanyController.deleteCompany(req, res, mockNext());

      expect(CompanyService.getOne).toHaveBeenCalledWith("company-id");

      expect(deleteMock).toHaveBeenCalledWith("company-id");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Empresa deletada com sucesso.",
      });
    });

    it("deve retornar 404 quando a empresa não existir", async () => {
      vi.spyOn(CompanyService, "getOne").mockResolvedValue(null);

      const deleteMock = vi.spyOn(CompanyService, "delete");

      const req = {
        params: {
          id: "company-id",
        },
      } as unknown as Request;

      const res = mockResponse();

      await CompanyController.deleteCompany(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Empresa não encontrada.",
      });

      expect(deleteMock).not.toHaveBeenCalled();
    });
  });

  describe("getOneCompany", () => {
    it("deve retornar uma empresa pelo ID", async () => {
      const company = {
        _id: "company-id",
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      vi.spyOn(CompanyService, "getOne").mockResolvedValue(company as any);

      const req = {
        params: {
          id: "company-id",
        },
      } as unknown as Request;

      const res = mockResponse();

      await CompanyController.getOneCompany(req, res, mockNext());

      expect(CompanyService.getOne).toHaveBeenCalledWith("company-id");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        company,
      });
    });

    it("deve retornar 404 quando a empresa não existir", async () => {
      vi.spyOn(CompanyService, "getOne").mockResolvedValue(null);

      const req = {
        params: {
          id: "company-id",
        },
      } as unknown as Request;

      const res = mockResponse();

      await CompanyController.getOneCompany(req, res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Empresa não encontrada.",
      });
    });
  });
});
