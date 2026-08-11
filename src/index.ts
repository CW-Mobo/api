// IMPORTAÇÕES DE MÓDULOS E CONFIGURAÇÕES
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import dns from "dns";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { errorMiddleware } from "./middlewares/errorMiddleware";

// CONFIGURAÇÃO DO AMBIENTE E INICIALIZAÇÃO DO EXPRESS
dotenv.config();
const app: Application = express();

// CONFIGURAÇÃO DE DNS PARA DESENVOLVIMENTO (EVITA ERROS DE RESOLUÇÃO)
if (process.env.NODE_ENV === "development") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// CONECTANDO AO BANCO DE DADOS
connectDB();

// IMPORTAÇÃO DE ROTAS
import AuthRoutes from "./routes/AuthRoutes";
import CompanyRoutes from "./routes/CompanyRoutes";
import HarvestRoutes from "./routes/HarvestRoutes";
import PlantingRoutes from "./routes/PlantingRoutes";
import ProfileRoutes from "./routes/ProfileRoutes";
import SensorDataRoutes from "./routes/SensorDataRoutes";
import SensorRoutes from "./routes/SensorRoutes";
import UserRoutes from "./routes/UserRoutes";

// CONFIGURAÇÃO DE CORS PARA PERMITIR ACESSO APENAS DE ORIGENS ESPECÍFICAS
const allowedOrigins = ["https://mobocw.vercel.app", "http://localhost:3000"];

// CONFIGURAÇÃO DE MIDDLEWARES
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (Ex: Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
  }),
);

// MIDDLEWARES PARA PARSEAR JSON, URL-ENCODED E COOKIES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// REGISTRO DAS ROTAS
app.use("/api/auth", AuthRoutes);
app.use("/api/company", CompanyRoutes);
app.use("/api/harvest", HarvestRoutes);
app.use("/api/planting", PlantingRoutes);
app.use("/api/profile", ProfileRoutes);
app.use("/api/sensordata", SensorDataRoutes);
app.use("/api/sensor", SensorRoutes);
app.use("/api/user", UserRoutes);

// ROTA PRINCIPAL DE TESTE
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "API Lychee rodando ✅" });
});

// ROTA DE HEALTH CHECK
app.get("/health", (_req: Request, res) => {
  res.status(200).json({
    success: true,
    message: "API online",
  });
});

// MANUSEIO DE ROTAS NÃO ENCONTRADAS
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// MIDDLEWARE DE TRATAMENTO DE ERROS
app.use(errorMiddleware);

// INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
