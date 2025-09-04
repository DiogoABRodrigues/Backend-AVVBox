import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from "socket.io";
import http from "http";

import './db';
import measuresRoutes from './routes/measures';
import usersRoutes from './routes/user';
import notificationsRoutes from './routes/notifications';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/measures', measuresRoutes);
app.use('/users', usersRoutes);
app.use('/notifications', notificationsRoutes);

// Inicializa Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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
