import { Buffer } from "node:buffer";

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

export type RipenessResult = {
  classe_prevista: "madura" | "nao_madura";
  confianca: number;
  nome_arquivo?: string;
};

type AIServiceResponse = RipenessResult & { detail?: string };

class AIServiceError extends Error {
  statusCode = 502;
}

class AIService {
  async analyzeImage(file: Express.Multer.File): Promise<RipenessResult> {
    return this.forwardPrediction({
      image_base64: Buffer.from(file.buffer).toString("base64"),
      mime_type: file.mimetype,
      file_name: file.originalname,
    });
  }

  async analyzeFrame(frame: {
    image_base64: string;
    mime_type?: string;
    file_name?: string;
  }): Promise<RipenessResult> {
    return this.forwardPrediction(frame);
  }

  private async forwardPrediction(
    frame: { image_base64: string; mime_type?: string; file_name?: string },
  ): Promise<RipenessResult> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/predict-frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(frame),
      });

      const result = (await response.json()) as AIServiceResponse;
      if (!response.ok) {
        throw new AIServiceError(result.detail || "O serviço de IA não conseguiu analisar a imagem.");
      }

      return result;
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError("Serviço de IA indisponível. Verifique a configuração AI_SERVICE_URL.");
    }
  }
}

export default new AIService();
