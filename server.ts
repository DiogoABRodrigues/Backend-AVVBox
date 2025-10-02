import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";

import "./db";
import measuresRoutes from "./src/routes/measures";
import usersRoutes from "./src/routes/user";
import notificationsRoutes from "./src/routes/notifications";
import settingsRoutes from "./src/routes/settings";
import availabilityRoutes from "./src/routes/availability";
import trainingRoutes from "./src/routes/training";
import exerciceRoutes from "./src/routes/exercice";
import "./src/jobs/dailyCleanup";
import "./src/jobs/wake-up";
import "./src/jobs/trainingNotifications";

import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: allowedOrigin }));

export const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());

// Rotas
app.use("/measures", measuresRoutes);
app.use("/users", usersRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/settings", settingsRoutes);
app.use("/availability", availabilityRoutes);
app.use("/training", trainingRoutes);
app.use("/exercises", exerciceRoutes);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} entrou na room`);
    console.log("Rooms do socket:", socket.rooms);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectou:", socket.id);
  });
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
