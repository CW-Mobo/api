import mongoose from "mongoose";
import Harvest from "./harvests.model";
import { IHarvest, HarvestInput, HarvestResult } from "./harvests.types";
import { IUserPayload } from "../../utils/jwt";
import { paginate, PaginateResult } from "../../utils/paginate";
import {
  checkOwnership,
  ownedFields,
  assignOwnership,
} from "../../utils/checkOwnership";

class HarvestService {
  // VERIFICA INTEGRIDADE DOS DADOS DE COLHEITA
  private checkHarvestIntegrity(data: HarvestInput): void {
    if (data.harvestedQuantity <= 0) {
      throw new Error("A quantidade colhida deve ser maior que zero.");
    }

    if (data.harvestEnd < data.harvestStart) {
      throw new Error(
        "A data final da colheita não pode ser anterior ao início.",
      );
    }
  }

  // LISTA TODAS AS COLHEITAS (SEM PAGINAÇÃO)
  async getAll(userSession: IUserPayload) {
    const filter =
      userSession.userRole === "family_farmer"
        ? { user: userSession.id }
        : { company: userSession.company! };

    return await Harvest.find(filter).populate("planting");
  }

  // LISTAR COLHEITAS COM PAGINAÇÃO
  async getPaginated(
    userSession: IUserPayload,
    page: number,
    limit: number,
  ): Promise<PaginateResult<IHarvest>> {
    if (page < 1) page = 1;
    if (limit > 20) limit = 20;

    const filter =
      userSession.userRole === "family_farmer"
        ? { user: userSession.id }
        : { company: userSession.company! };

    return await paginate(Harvest, filter, page, limit, { harvestDate: -1 }, [
      "planting",
    ]);
  }

  // CRIAR COLHEITA
  async create(
    userSession: IUserPayload,
    data: HarvestInput,
  ): Promise<IHarvest> {
    this.checkHarvestIntegrity(data);

    const newHarvest = new Harvest(data);

    assignOwnership(userSession, newHarvest);

    await newHarvest.save();

    return newHarvest;
  }

  // ATUALIZAR COLHEITA
  async update(
    id: string,
    userSession: IUserPayload,
    data: HarvestInput,
  ): Promise<HarvestResult> {
    const harvest = await Harvest.findById(id);

    if (!harvest) {
      return {
        success: false,
        message: "Colheita não encontrada",
      };
    }

    checkOwnership(userSession, ownedFields(harvest));

    this.checkHarvestIntegrity(data);

    const updatedHarvest = await Harvest.findByIdAndUpdate(id, data, {
      new: true,
    });

    return {
      success: true,
      message: "Colheita atualizada com sucesso.",
      harvest: updatedHarvest!,
    };
  }

  // DELETAR VÁRIAS COLHEITAS
  async deleteMany(
    userSession: IUserPayload,
    ids: string[],
  ): Promise<HarvestResult> {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    // Sanitizar e validar IDs
    const sanitizedIds = idsArray.filter((id) =>
      mongoose.Types.ObjectId.isValid(String(id)),
    );

    if (sanitizedIds.length === 0) {
      return {
        success: false,
        message: "IDs inválidos.",
      };
    }

    const harvests = await Harvest.find({
      _id: {
        $in: sanitizedIds,
      },
    });

    if (harvests.length === 0) {
      return {
        success: false,
        message: "Nenhuma colheita encontrada.",
      };
    }

    for (const harvest of harvests) {
      checkOwnership(userSession, ownedFields(harvest));
    }

    await Harvest.deleteMany({
      _id: {
        $in: sanitizedIds,
      },
    });

    return {
      success: true,
      message: "Colheitas deletadas com sucesso.",
    };
  }

  // BUSCAR COLHEITA ESPECÍFICA
  async getOne(
    id: string,
    userSession: IUserPayload,
  ): Promise<IHarvest | null> {
    const harvest = await Harvest.findById(id).populate("planting");

    if (!harvest) {
      return null;
    }

    checkOwnership(userSession, ownedFields(harvest));

    return harvest;
  }
}

export default new HarvestService();
