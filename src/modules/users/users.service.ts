import bcrypt from "bcrypt";
import { cloudinary } from "../../config/cloudinary";
import User from "./users.model";
import { UserInput } from "./users.types";

class UserService {
  // DELETAR IMAGEM DO CLOUDINARY

  private async deleteUserImage(id: string): Promise<void> {
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

  // ATUALIZAR USUÁRIO

  async update(id: string, data: Partial<UserInput>) {
    try {
      const updateData = { ...data };

      if (updateData.company === "") {
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

    return {
      success: true,
      message: "Usuário deletado com sucesso",
    };
  }

  // BUSCAR UM USUÁRIO ESPECÍFICO

  async getOne(id: string) {
    return await User.findById(id).select("-userPassword");
  }
}

export default new UserService();
