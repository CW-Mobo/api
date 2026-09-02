import { Response } from "express";
import UserService from "../users.service";
import { UserInput } from "../users.types";
import asyncHandler from "../../../utils/asyncHandler";
import { AuthRequest } from "../../../middlewares/authMiddleware";

class ProfileController {
  // ATUALIZAR USUÁRIO - PESSOAL
  updateUser = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = req.user!.id;

      const userData: UserInput = {
        ...req.body,
        userImage: req.file
          ? (req.file as Express.Multer.File).path
          : undefined,
      };

      const updatedUser = await UserService.update(
        id,
        userData,
      );

      if (!updatedUser) {
        return res.status(400).json({
          success: false,
          message: "Não foi possível atualizar o usuário.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Usuário atualizado com sucesso.",
        updatedUser,
      });
    },
  );

  // DELETAR USUÁRIO - PESSOAL
  deleteUser = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = req.user!.id;

      await UserService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Conta deletada com sucesso.",
      });
    },
  );

  // BUSCAR USUÁRIO LOGADO
  getUser = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = req.user!.id;

      const user = await UserService.getOne(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    },
  );
}

export default new ProfileController();