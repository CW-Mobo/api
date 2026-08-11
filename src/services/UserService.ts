import bcrypt from "bcrypt";
import { cloudinary } from "../config/cloudinary";
import User from "../models/User";
import { generateToken, IUserPayload } from "../utils/jwt";

// TIPO PARA DETALHES ESPECÍFICOS DE AGRICULTORES FAMILIARES
interface FarmerDetails {
  cpf: string;
  dap: string;
}

// TIPO DE DADOS PARA CRIAÇÃO/ATUALIZAÇÃO DE USUÁRIO
export interface UserInput {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhone?: string;
  userRole: "family_farmer" | "company_admin" | "company_worker";
  company?: string;
  farmerDetails?: FarmerDetails;
  userImage?: string;
}

// TIPO PARA O RESULTADO DA CRIAÇÃO DO USUÁRIO
interface UserResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    userImage?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userRole: string;
    company?: string;
    farmerDetails?: FarmerDetails;
  };
}

class UserService {
  // DELETAR IMAGEM DO CLOUDINARY
  private async deleteUserImage(id: string) {
    try {
      const publicId = `mobo/users/${id}`;
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        console.log(`Imagem do usuário ${id} deletada do Cloudinary`);
      } else if (result.result === "not found") {
        console.error(`Nenhuma imagem encontrada para o usuário ${id}`);
      }
    } catch (error) {
      console.error("Erro ao deletar imagem do Cloudinary:", error);
    }
  }

  // LISTAR TODOS OS USUÁRIOS DE UMA EMPRESA
  async getAll(companyId?: string) {
    const query = companyId ? { company: companyId } : {};
    return await User.find(query);
  }

  // CRIAR UM NOVO USUÁRIO
  async create(data: UserInput): Promise<UserResult> {
    try {
      const {
        userName,
        userEmail,
        userPassword,
        userRole,
        farmerDetails,
        company,
        userPhone,
        userImage,
      } = data;

      // Verificação de campos obrigatórios
      if (!userName || !userEmail || !userPassword || !userRole) {
        return {
          success: false,
          message: "Campos obrigatórios não preenchidos.",
        };
      }

      // Sanitização do email
      const sanitizedEmail = userEmail.toString().toLowerCase().trim();

      if (!sanitizedEmail) {
        return {
          success: false,
          message: "E-mail inválido.",
        };
      }

      // Preenchendo o campo farmerDetails se userRole = "family_farmer"
      let parsedFarmerDetails: FarmerDetails | undefined;
      if (userRole === "family_farmer") {
        if (!farmerDetails?.cpf || !farmerDetails?.dap) {
          return {
            success: false,
            message:
              "Campos CPF e DAP são obrigatórios para agricultores familiares.",
          };
        }
        parsedFarmerDetails = {
          cpf: farmerDetails.cpf,
          dap: farmerDetails.dap,
        };
      }

      // Verificando se o email cadastrado já existe
      const existing = await User.findOne({ userEmail: sanitizedEmail });
      if (existing) {
        return { success: false, message: "Usuário já cadastrado." };
      }

      // Sanitizando campo company para evitar string vazia sendo salva no banco
      const sanitizedCompany = company && company !== "" ? company : undefined;

      // Cadastrando usuário
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      const newUser = new User({
        userName,
        userEmail: sanitizedEmail,
        userPassword: hashedPassword,
        userRole,
        userPhone,
        userImage,
        company: sanitizedCompany,
        farmerDetails: parsedFarmerDetails,
      });
      await newUser.save();
      const newUserId = newUser._id ? newUser._id.toString() : "";
      const payload: IUserPayload = {
        id: newUserId,
        userRole: newUser.userRole as
          | "family_farmer"
          | "company_admin"
          | "company_worker",
        company: newUser.company as string | undefined,
      };

      const token = generateToken(payload);

      return {
        success: true,
        message: "Usuário criado com sucesso.",
        token,
        user: {
          id: newUserId,
          userImage: newUser.userImage,
          userName: newUser.userName,
          userEmail: newUser.userEmail,
          userPhone: newUser.userPhone,
          userRole: newUser.userRole,
          company: newUser.company?.toString(),
          farmerDetails: newUser.farmerDetails,
        },
      };
    } catch (error) {
      console.error("Erro em create UserService:", error);
      return { success: false, message: "Erro ao criar usuário." };
    }
  }

  // ATUALIZAR USUÁRIO
  async update(id: string, data: Partial<UserInput>) {
    try {
      const updateData: any = { ...data };

      if (updateData.company && updateData.company === "") {
        updateData.company = undefined;
      }
      if (data.userPassword) {
        updateData.userPassword = await bcrypt.hash(data.userPassword, 10);
      }
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error("Erro em update UserService:", error);
      throw error;
    }
  }

  // DELETAR USUÁRIO
  async delete(id: string) {
    await this.deleteUserImage(id);
    await User.findByIdAndDelete(id);
    return { success: true, message: "Usuário deletado com sucesso" };
  }

  // BUSCAR UM USUÁRIO ESPECÍFICO
  async getOne(id: string) {
    return await User.findById(id).select("-userPassword");
  }

  // AUTENTICAR USUÁRIO
  async authenticate(data: {
    userEmail: string;
    userPassword: string;
  }): Promise<UserResult> {
    try {
      const { userEmail, userPassword } = data;

      const user = await User.findOne({
        userEmail: userEmail.toLowerCase().trim(),
      });
      if (!user) return { success: false, message: "Usuário não encontrado." };

      const correct = await bcrypt.compare(userPassword, user.userPassword);
      if (!correct) return { success: false, message: "Senha incorreta." };

      const userId = user._id ? user._id.toString() : "";
      const payload: IUserPayload = {
        id: userId,
        userRole: user.userRole as
          | "family_farmer"
          | "company_admin"
          | "company_worker",
        company: user.company as string | undefined,
      };

      const token = generateToken(payload);

      return {
        success: true,
        message: "Login efetuado com sucesso!",
        token,
        user: {
          id: userId,
          userRole: user.userRole,
          company: user.company?.toString(),
        },
      };
    } catch (error) {
      console.error("Erro em authenticate UserService:", error);
      return { success: false, message: "Erro ao autenticar usuário." };
    }
  }
}

export default new UserService();
