import Company from "./companies.model";
import { ICompany } from "./companies.types";

// TIPO DE DADOS PARA CRIAÇÃO/ATUALIZAÇÃO DE EMPRESA
export interface CompanyInput {
  companyCNPJ: string;
  ownerName: string;
  companyName?: string;
  subscriptionPlan?: ICompany["subscriptionPlan"];
  companyAddress?: ICompany["companyAddress"];
}

class CompanyService {
  // LISTAR TODAS AS EMPRESAS
  async getAll(): Promise<ICompany[]> {
    return await Company.find();
  }

  // CRIAR NOVA EMPRESA
  async create(data: CompanyInput): Promise<ICompany> {
    const newCompany = new Company(data);
    await newCompany.save();

    return newCompany;
  }

  // ATUALIZAR EMPRESA
  async update(id: string, data: CompanyInput): Promise<ICompany | null> {
    return await Company.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  // DELETAR EMPRESA
  async delete(id: string): Promise<void> {
    await Company.findByIdAndDelete(id);
  }

  // BUSCAR UMA EMPRESA ESPECÍFICA
  async getOne(id: string): Promise<ICompany | null> {
    return await Company.findById(id);
  }

  // BUSCAR EMPRESA POR CNPJ
  async getByCNPJ(cnpj: string): Promise<ICompany | null> {
    const sanitizedCNPJ = String(cnpj).replace(/\D/g, "").trim();

    return await Company.findOne({
      companyCNPJ: sanitizedCNPJ,
    });
  }
}

export default new CompanyService();
