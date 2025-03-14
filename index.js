import express from "express";
import path from "node:path";
import { config } from "dotenv";
config();
import { controllerHandler } from "./src/utils/controllers-handler.utils.js";
import { database_connect } from "./src/DB/connection.js";
import { globalErrorHandling } from "./src/middleware/globalErrorHandling.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import adminGraphController from "./src/modules/GraphQL/admin.controller.js";
import { runIo } from "./src/modules/Socket/socket.controller.js";
import './src/utils/cron/deleteExpiredOTPs.js';


const authLimiter = rateLimit({
  limit: 60,
  windowMs: 2 * 60 * 1000,
  message: { error: "Rate limit exceeded" }
});

const jobLimiter = rateLimit({
  limit: 30,
  windowMs: 2 * 60 * 1000,
  message: { error: "Rate limit exceeded" }
});

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use("/auth", authLimiter);
  app.use("/job", jobLimiter);
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/admin", adminGraphController);

  //main router
  app.get('/', async (req, res) => res.status(200).json({ message: "Job Search App is running" }));


  controllerHandler(app);
  database_connect();
  app.use(globalErrorHandling);
  const httpServer = app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
  runIo(httpServer);
}




bootstrap();
