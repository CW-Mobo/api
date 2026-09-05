import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import HarvestImage from "../../../src/modules/harvest-images/harvest-images.model";
import HarvestImageService from "../../../src/modules/harvest-images/harvest-images.service";

describe("HarvestImageService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const userId = "507f1f77bcf86cd799439012";

  const mockImage = {
    _id: "507f1f77bcf86cd799439013",
    user: userId,
    imageName: "harvest-image.jpg",
    createdAt: new Date("2026-01-15"),
  };

  describe("getUserImages", () => {
    it("deve retornar todas as imagens do usuário", async () => {
      const lean = vi.fn().mockResolvedValue([mockImage]);

      const sort = vi.fn().mockReturnValue({
        lean,
      });

      vi.spyOn(HarvestImage, "find").mockReturnValue({
        sort,
      } as any);

      const result = await HarvestImageService.getUserImages(userId);

      expect(HarvestImage.find).toHaveBeenCalledWith({
        user: userId,
      });

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(lean).toHaveBeenCalled();

      expect(result).toEqual([mockImage]);
    });

    it("deve retornar um array vazio quando nenhuma imagem for encontrada", async () => {
      const lean = vi.fn().mockResolvedValue([]);

      const sort = vi.fn().mockReturnValue({
        lean,
      });

      vi.spyOn(HarvestImage, "find").mockReturnValue({
        sort,
      } as any);

      const result = await HarvestImageService.getUserImages(userId);

      expect(HarvestImage.find).toHaveBeenCalledWith({
        user: userId,
      });

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(lean).toHaveBeenCalled();

      expect(result).toEqual([]);
    });

    it("deve retornar um array vazio quando ocorrer um erro", async () => {
      vi.spyOn(HarvestImage, "find").mockImplementation(() => {
        throw new Error("Erro no banco de dados");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await HarvestImageService.getUserImages(userId);

      expect(result).toEqual([]);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erro ao buscar imagens:",
        expect.any(Error),
      );
    });

    it("deve retornar um array vazio quando nenhuma imagem for encontrada", async () => {
      const sort = vi.fn().mockResolvedValue([]);

      vi.spyOn(HarvestImage, "find").mockReturnValue({
        sort,
      } as any);

      const result = await HarvestImageService.getUserImages(userId);

      expect(HarvestImage.find).toHaveBeenCalledWith({
        user: userId,
      });

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(result).toEqual([]);
    });

    it("deve retornar um array vazio quando ocorrer um erro", async () => {
      vi.spyOn(HarvestImage, "find").mockImplementation(() => {
        throw new Error("Erro no banco de dados");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await HarvestImageService.getUserImages(userId);

      expect(result).toEqual([]);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erro ao buscar imagens:",
        expect.any(Error),
      );
    });
  });

  describe("uploadImage", () => {
    it("deve salvar uma imagem com sucesso", async () => {
      const save = vi
        .spyOn(HarvestImage.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await HarvestImageService.uploadImage(
        userId,
        "harvest-image.jpg",
      );

      expect(save).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image?.user?.toString()).toBe(userId);
      expect(result.image?.imageName).toBe("harvest-image.jpg");
    });

    it("deve criar a imagem com o usuário e nome do arquivo informados", async () => {
      const save = vi
        .spyOn(HarvestImage.prototype, "save")
        .mockImplementation(async function () {
          return this;
        });

      const result = await HarvestImageService.uploadImage(
        userId,
        "lichia-01.jpg",
      );

      expect(save).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image?.user?.toString()).toBe(userId);
      expect(result.image?.imageName).toBe("lichia-01.jpg");
    });

    it("deve retornar erro quando ocorrer uma falha ao salvar a imagem", async () => {
      vi.spyOn(HarvestImage.prototype, "save").mockRejectedValue(
        new Error("Erro ao salvar"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await HarvestImageService.uploadImage(
        userId,
        "harvest-image.jpg",
      );

      expect(result).toEqual({
        success: false,
        message: "Erro ao salvar imagem",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erro ao salvar imagem:",
        expect.any(Error),
      );
    });
  });
});
