import Planting from "./plantings.model";

import {
  IPlanting,
  PlantingInput,
  PlantingResult,
} from "./plantings.types";

import { IUserPayload } from "../../utils/jwt";

import {
  checkOwnership,
  ownedFields,
  assignOwnership,
} from "../../utils/checkOwnership";

class PlantingService {
  // LISTAR PLANTAÇÕES
  async getAll(
    userSession: IUserPayload,
  ): Promise<IPlanting[]> {
    const filter =
      userSession.userRole === "family_farmer"
        ? { user: userSession.id }
        : { company: userSession.company };

    return Planting.find(filter);
  }

  // CRIAR PLANTAÇÃO
  async create(
    userSession: IUserPayload,
    data: PlantingInput,
  ): Promise<IPlanting> {
    const newPlanting = new Planting(data);

    assignOwnership(userSession, newPlanting);

    await newPlanting.save();

    return newPlanting;
  }

  // ATUALIZAR PLANTAÇÃO
  async update(
    id: string,
    userSession: IUserPayload,
    data: PlantingInput,
  ): Promise<PlantingResult> {
    const planting = await Planting.findById(id);

    if (!planting) {
      return {
        success: false,
        message: "Plantação não encontrada.",
      };
    }

    checkOwnership(userSession, ownedFields(planting));

    const updatePlanting = await Planting.findByIdAndUpdate(
      id,
      data,
      { new: true },
    );

    return {
      success: true,
      message: "Plantação atualizada com sucesso.",
      planting: updatePlanting!,
    };
  }

  // DELETAR PLANTAÇÃO
  async delete(
    id: string,
    userSession: IUserPayload,
  ): Promise<PlantingResult> {
    const planting = await Planting.findById(id);

    if (!planting) {
      return {
        success: false,
        message: "Plantação não encontrada.",
      };
    }

    checkOwnership(userSession, ownedFields(planting));

    await Planting.findByIdAndDelete(id);

    return {
      success: true,
      message: "Plantação deletada com sucesso.",
    };
  }

  // BUSCAR PLANTAÇÃO ESPECÍFICA
  async getOne(
    id: string,
    userSession: IUserPayload,
  ): Promise<PlantingResult> {
    const planting = await Planting.findById(id);

    if (!planting) {
      return {
        success: false,
        message: "Plantação não encontrada.",
      };
    }

    checkOwnership(userSession, ownedFields(planting));

    return {
      success: true,
      planting,
    };
  }
}

export default new PlantingService();