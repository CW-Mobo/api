import bcrypt from "bcrypt";
import User from "../users.model";
import { UserInput, UserResult } from "../users.types";
import { generateToken, IUserPayload } from "../../../utils/jwt";

class AuthService {
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

      if (!user) {
        return {
          success: false,
          message: "Usuário não encontrado.",
        };
      }

      const correct = await bcrypt.compare(userPassword, user.userPassword);

      if (!correct) {
        return {
          success: false,
          message: "Senha incorreta.",
        };
      }

      const userId = user._id.toString();

      const payload: IUserPayload = {
        id: userId,
        userRole: user.userRole,
        company: user.company?.toString(),
      };

      const token = generateToken(payload);

      return {
        success: true,
        message: "Login efetuado com sucesso!",
        token,
        user: {
          id: userId,
          userImage: user.userImage,
          userName: user.userName,
          userEmail: user.userEmail,
          userPhone: user.userPhone,
          userRole: user.userRole,
          company: user.company?.toString(),
          farmerDetails: user.farmerDetails,
        },
      };
    } catch (error) {
      console.error("Erro em authenticate AuthService:", error);

      return {
        success: false,
        message: "Erro ao autenticar usuário.",
      };
    }
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

      if (!userName || !userEmail || !userPassword || !userRole) {
        return {
          success: false,
          message: "Campos obrigatórios não preenchidos.",
        };
      }

      const sanitizedEmail = userEmail.toString().toLowerCase().trim();

      if (!sanitizedEmail) {
        return {
          success: false,
          message: "E-mail inválido.",
        };
      }

      let parsedFarmerDetails = undefined;

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

      const existing = await User.findOne({
        userEmail: sanitizedEmail,
      });

      if (existing) {
        return {
          success: false,
          message: "Usuário já cadastrado.",
        };
      }

      const sanitizedCompany = company && company !== "" ? company : undefined;

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

      const userId = newUser._id.toString();

      const payload: IUserPayload = {
        id: userId,
        userRole: newUser.userRole,
        company: newUser.company?.toString(),
      };

      const token = generateToken(payload);

      return {
        success: true,
        message: "Usuário criado com sucesso.",
        token,
        user: {
          id: userId,
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
      console.error("Erro em create AuthService:", error);

      return {
        success: false,
        message: "Erro ao criar usuário.",
      };
    }
  }
}

export default new AuthService();
