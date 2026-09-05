import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "dns";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "./middlewares/errorMiddleware";

import CompanyRoutes from "./modules/companies/companies.routes";
import HarvestRoutes from "./modules/harvests/harvests.routes";
import HarvestImagesRoutes from "./modules/harvest-images/harvest-images.routes";
import PlantingRoutes from "./modules/plantings/plantings.routes";
import SensorDataRoutes from "./modules/sensor-data/sensor-data.routes";
import SensorRoutes from "./modules/sensors/sensors.routes";
import UserRoutes from "./modules/users/users.routes";
import AuthRoutes from "./modules/users/auth/auth.routes";

dotenv.config();

const app: Application = express();

if (process.env.NODE_ENV === "development") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const allowedOrigins = [
  "https://mobocw.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", AuthRoutes);
app.use("/api/company", CompanyRoutes);
app.use("/api/harvest", HarvestRoutes);
app.use("/api/planting", PlantingRoutes);
app.use("/api/profile", HarvestImagesRoutes);
app.use("/api/sensordata", SensorDataRoutes);
app.use("/api/sensor", SensorRoutes);
app.use("/api/user", UserRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "API Lychee rodando ✅",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API online",
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Rota não encontrada",
  });
});

app.use(errorMiddleware);

export default app;