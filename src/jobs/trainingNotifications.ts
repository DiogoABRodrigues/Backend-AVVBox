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
  onetwentyMin?: boolean;
  [key: string]: boolean | undefined;
}

// Função para combinar date + hour em um Date object
function combineDateAndHour(date: Date, hourString: string): Date {
  const [hours, minutes] = hourString.split(':').map(Number);
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate;
}

// Função para obter o texto da notificação
function getNotificationMessage(minutesBefore: number): string {
  switch (minutesBefore) {
    case NOTIFY_SIXTY_MIN:
      return "Falta 1 hora para o teu treino.";
    case NOTIFY_ONE_TWENTY_MIN:
      return "Faltam 2 horas para o teu treino.";
    default:
      return `Faltam ${minutesBefore} minutos para o teu treino.`;
  }
}
function getNowInLisbon(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
}

function getStartAndEndOfLisbonDay(): { startOfDay: Date; endOfDay: Date } {
  const nowLisbon = getNowInLisbon();
  const startOfDay = new Date(nowLisbon);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(nowLisbon);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

// correr Às 00 15 30 e 45 minutos de cada hora
cron.schedule("0,15,30,45 * * * *", async () => {
  try {
    const now = getNowInLisbon();
    console.log(`🕒 Agora (Lisboa): ${now.toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" })}`);

    const { startOfDay, endOfDay } = getStartAndEndOfLisbonDay();

    const notifyTimes = [
      { minutesBefore: NOTIFY_FIFTEEN_MIN, field: "fifteenMin" },
      { minutesBefore: NOTIFY_THIRTY_MIN, field: "thirtyMin" },
      { minutesBefore: NOTIFY_SIXTY_MIN, field: "sixtyMin" },
      { minutesBefore: NOTIFY_ONE_TWENTY_MIN, field: "onetwentyMin" },
    ];

    // Buscar todos os treinos confirmados do dia atual em Lisboa
    const allTrainings = await Training.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      overallStatus: "confirmed",
    });

    allTrainings.forEach(t => {
      const combinedTime = combineDateAndHour(t.date, t.hour);
      console.log(`Treino ID: ${t._id}, Horário combinado: ${combinedTime}`);
    });

    if (allTrainings.length === 0) return;

    const allUserIds = Array.from(
      new Set(allTrainings.flatMap(t => [t.athlete.toString(), t.PT.toString()]))
    );

    const users = await userService.getByIds(allUserIds);
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const settingsList = await settingsService.getByUserIds(allUserIds);
    const settingsMap = new Map(settingsList.map(s => [s.user.toString(), s]));

    for (const notify of notifyTimes) {
      const trainingsToNotify = allTrainings.filter(training => {
        const trainingDateTime = combineDateAndHour(training.date, training.hour);

        const timeDiff = trainingDateTime.getTime() - now.getTime(); // ✅ comparar com hora de Lisboa
        const minutesUntilTraining = Math.round(timeDiff / (1000 * 60));

        const timeDiffFromTarget = Math.abs(minutesUntilTraining - notify.minutesBefore);
        const shouldNotify = timeDiffFromTarget <= 2 && minutesUntilTraining > 0;

        return shouldNotify;
      });

      for (const training of trainingsToNotify) {
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
          const message = getNotificationMessage(notify.minutesBefore);
          await notificationService.createNotification(
            pt._id.toString(),
            "Treino prestes a começar",
            message,
            targets
          );
        }
      }
    }
  } catch (err) {
    console.error("❌ Erro no cron de notificações:", err);
  }
});
