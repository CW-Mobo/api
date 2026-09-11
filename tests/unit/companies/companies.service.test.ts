import { describe, it, expect, vi, beforeEach } from "vitest";
import CompanyService from "../../../src/modules/companies/companies.service";
import Company from "../../../src/modules/companies/companies.model";

describe("CompanyService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAll", () => {
    it("deve retornar todas as empresas", async () => {
      const companies = [
        {
          companyCNPJ: "12345678000199",
          ownerName: "João Silva",
          companyName: "Empresa 1",
        },
        {
          companyCNPJ: "98765432000188",
          ownerName: "Maria Silva",
          companyName: "Empresa 2",
        },
      ];

      vi.spyOn(Company, "find").mockResolvedValue(companies as any);
      const result = await CompanyService.getAll();
      expect(result).toEqual(companies);
      expect(Company.find).toHaveBeenCalledOnce();
    });
  });

  describe("create", () => {
    it("deve criar e salvar uma empresa", async () => {
      const companyData = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      const save = vi
        .spyOn(Company.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await CompanyService.create(companyData);
      expect(save).toHaveBeenCalledOnce();

      expect(result.companyCNPJ).toBe(companyData.companyCNPJ);
      expect(result.ownerName).toBe(companyData.ownerName);
      expect(result.companyName).toBe(companyData.companyName);

      expect(result.subscriptionPlan).toMatchObject({
        maxUsers: 5,
        isActive: true,
      });

      expect(result.companyAddress).toBeDefined();
      expect(result._id).toBeDefined();
    });
  });

  describe("update", () => {
    it("deve atualizar e retornar uma empresa", async () => {
      const companyData = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Atualizada",
      };

      const updatedCompany = {
        _id: "company-id",
        ...companyData,
      };

      vi.spyOn(Company, "findByIdAndUpdate").mockResolvedValue(
        updatedCompany as any,
      );

      const result = await CompanyService.update("company-id", companyData);

      expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
        "company-id",
        companyData,
        {
          new: true,
        },
      );

      expect(result).toEqual(updatedCompany);
    });

    it("deve retornar null quando a empresa não for encontrada", async () => {
      const companyData = {
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Atualizada",
      };

      vi.spyOn(Company, "findByIdAndUpdate").mockResolvedValue(null);

      const result = await CompanyService.update("company-id", companyData);

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deve deletar uma empresa", async () => {
      const deleteMock = vi
        .spyOn(Company, "findByIdAndDelete")
        .mockResolvedValue({} as any);

      await CompanyService.delete("company-id");

      expect(deleteMock).toHaveBeenCalledWith("company-id");
      expect(deleteMock).toHaveBeenCalledOnce();
    });
  });

  describe("getOne", () => {
    it("deve retornar uma empresa pelo ID", async () => {
      const company = {
        _id: "company-id",
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      vi.spyOn(Company, "findById").mockResolvedValue(company as any);

      const result = await CompanyService.getOne("company-id");

      expect(Company.findById).toHaveBeenCalledWith("company-id");
      expect(result).toEqual(company);
    });

    it("deve retornar null quando a empresa não for encontrada", async () => {
      vi.spyOn(Company, "findById").mockResolvedValue(null);

      const result = await CompanyService.getOne("company-id");

      expect(result).toBeNull();
    });
  });

  describe("getByCNPJ", () => {
    it("deve remover caracteres não numéricos antes de buscar o CNPJ", async () => {
      const company = {
        _id: "company-id",
        companyCNPJ: "12345678000199",
        ownerName: "João Silva",
        companyName: "Empresa Teste",
      };

      const findOneMock = vi
        .spyOn(Company, "findOne")
        .mockResolvedValue(company as any);

      const result = await CompanyService.getByCNPJ("12.345.678/0001-99");

      expect(findOneMock).toHaveBeenCalledWith({
        companyCNPJ: "12345678000199",
      });

      expect(result).toEqual(company);
    });

    it("deve retornar null quando o CNPJ não for encontrado", async () => {
      vi.spyOn(Company, "findOne").mockResolvedValue(null);

      const result = await CompanyService.getByCNPJ("12.345.678/0001-99");

      expect(result).toBeNull();
    });
  });
});
