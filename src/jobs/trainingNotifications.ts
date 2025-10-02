import cron from "node-cron";
import { Training } from "../models/Training";
import { notificationService } from "../services/notificationService";
import { settingsService } from "../services/settingsService";
import { userService } from "../services/userService";

const NOTIFY_FIFTEEN_MIN = 15;
const NOTIFY_THIRTY_MIN = 30;
const NOTIFY_SIXTY_MIN = 60;
const NOTIFY_ONE_TWENTY_MIN = 120;

interface UserSettings {
  fifteenMin?: boolean;
  thirtyMin?: boolean;
  sixtyMin?: boolean;
  oneTwentyMin?: boolean;
  [key: string]: boolean | undefined;
}

// Roda a cada 15 minutos (00, 15, 30, 45)
cron.schedule("0,15,30,45 * * * *", async () => {
  try {
    const now = new Date();

    const notifyTimes = [
      { minutesBefore: NOTIFY_FIFTEEN_MIN, field: "fifteenMin" },
      { minutesBefore: NOTIFY_THIRTY_MIN, field: "thirtyMin" },
      { minutesBefore: NOTIFY_SIXTY_MIN, field: "sixtyMin" },
      { minutesBefore: NOTIFY_ONE_TWENTY_MIN, field: "oneTwentyMin" },
    ];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Busca todos os treinos confirmados de hoje
    const trainings = await Training.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      overallStatus: "confirmed",
    });

    if (trainings.length === 0) return;

    // Obter todos os IDs de utilizadores (atletas + PTs) de uma vez
    const userIds = Array.from(
      new Set(trainings.flatMap(t => [t.athlete.toString(), t.PT.toString()]))
    );

    // Buscar todos os utilizadores e settings de uma vez
    const users = await userService.getByIds(userIds); // precisa criar método getByIds
    const settingsList = await settingsService.getByUserIds(userIds); // precisa criar método getByUserIds

    // Map de utilizador e settings para acesso rápido
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const settingsMap = new Map(settingsList.map(s => [s.user.toString(), s]));

    for (const notify of notifyTimes) {
      const targetTime = new Date(now.getTime() + notify.minutesBefore * 60000);
      const roundedMinutes = Math.floor(targetTime.getMinutes() / 15) * 15;
      targetTime.setMinutes(roundedMinutes, 0, 0);

      for (const training of trainings) {
        const athlete = userMap.get(training.athlete.toString());
        const pt = userMap.get(training.PT.toString());

        if (!athlete || !pt) continue;

        const athleteSettings = settingsMap.get(athlete._id.toString());
        const ptSettings = settingsMap.get(pt._id.toString());

        const targets = [
          (athleteSettings as unknown as UserSettings)?.[notify.field] ? athlete._id.toString() : null,
          (ptSettings as unknown as UserSettings)?.[notify.field] ? pt._id.toString() : null,
        ].filter(Boolean) as string[];

        if (targets.length > 0) {
          await notificationService.createNotification(
            pt._id.toString(), // id do autor
            "Treino prestes a começar",
            `Faltam ${notify.minutesBefore} minutos para o teu treino.`,
            targets
          );
        }
      }
    }
  } catch (err) {
    console.error("Erro no cron de notificações:", err);
  }
});
