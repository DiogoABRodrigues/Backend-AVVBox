import cron from "node-cron";
import { Notification } from "../models/Notifications";
import { Training } from "../models/Training";

// Agenda para todos os dias à meia-noite
cron.schedule(
  "00 00 * * *",
  () => {
    console.log("Cronjob diário a correr à meia-noite");

    // apagar treinos com data anterior a hoje
    const date = Date.now();
    Training.deleteMany({ date: { $lt: date } }).exec();

    // apagar notificações com target vazio (todos leram)
    Notification.deleteMany({ target: { $size: 0 } }).exec();
  },
  {
    timezone: "Europe/Lisbon",
  },
);
