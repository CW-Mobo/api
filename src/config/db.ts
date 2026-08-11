import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { DB_USER, DB_PASSWORD, DB_NAME, USE_LOCAL_DB } = process.env;

// VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE
if (!DB_NAME) {
  console.error("❌ Variável de ambiente DB_NAME não configurada");
  process.exit(1);
}

// FUNÇÃO PARA CONECTAR AO BANCO DE DADOS
export const connectDB = async (): Promise<void> => {
  try {
    let uri: string;

    if (USE_LOCAL_DB === "true") {
      // Conexão com MongoDB local
      uri = `mongodb://127.0.0.1:27017/${DB_NAME}`;
      console.log("🌐 Conectando ao MongoDB local...");
    } else {
      // Conexão com MongoDB Atlas
      if (!DB_USER || !DB_PASSWORD) {
        console.error(
          "❌ Variáveis de ambiente DB_USER ou DB_PASSWORD não configuradas para Atlas",
        );
        process.exit(1);
      }
      // Codificar a senha para evitar problemas com caracteres especiais
      const encodedPassword = encodeURIComponent(DB_PASSWORD);

      uri = `mongodb+srv://${DB_USER}:${encodedPassword}@mobo.eswkbcg.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=mobo`;
      console.log("🌐 Conectando ao MongoDB Atlas...");
    }

    await mongoose.connect(uri);
    console.log("✅ Conectado ao MongoDB com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

export default mongoose;
