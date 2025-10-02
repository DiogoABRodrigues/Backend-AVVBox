import cron from "node-cron";
import { Notification } from "../models/Notifications";
import { Training } from "../models/Training";

cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Cronjob diário a correr à meia-noite");

    try {
      const now = new Date();

      // apagar treinos antigos
      const deletedTrainings = await Training.deleteMany({ date: { $lt: now } });
      console.log(`Treinos apagados: ${deletedTrainings.deletedCount}`);

      // apagar notificações com target vazio
      const deletedNotifications = await Notification.deleteMany({ target: { $size: 0 } });
      console.log(`Notificações apagadas: ${deletedNotifications.deletedCount}`);
    } catch (err) {
      console.error("Erro no cron diário:", err);
    }
  },
  {
    timezone: "Europe/Lisbon",
  },
);
