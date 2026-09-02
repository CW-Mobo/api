import HarvestImage from "./harvest-images.model";

import {
  IHarvestImage,
  UploadImageResult,
} from "./harvest-images.types";

class HarvestImageService {
  // BUSCAR IMAGENS DE COLHEITA DO USUÁRIO
  async getUserImages(userId: string): Promise<IHarvestImage[]> {
    try {
      const images = await HarvestImage.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

      return images;
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      return [];
    }
  }

  // ENVIAR IMAGEM DE PERFIL DO USUÁRIO
  async uploadImage(
    userId: string,
    imageName: string,
  ): Promise<UploadImageResult> {
    try {
      const newImage = new HarvestImage({
        user: userId,
        imageName,
      });

      await newImage.save();

      return {
        success: true,
        image: newImage,
      };
    } catch (error) {
      console.error("Erro ao salvar imagem:", error);

      return {
        success: false,
        message: "Erro ao salvar imagem",
      };
    }
  }
}

export default new HarvestImageService();