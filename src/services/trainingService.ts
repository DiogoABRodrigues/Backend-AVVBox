import { Training } from "../models/Training";
import { Types } from "mongoose";
import { settingsService } from "./settingsService";
import { socketFunction } from "../controllers/notificationController";
import { notificationService } from "./notificationService";
import { User } from "../models/User";

export const trainingService = {
  async getByPT(ptId: string) {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    return Training.find({
      PT: new Types.ObjectId(ptId),
      overallStatus: { $ne: "rejected" },
      date: { $gte: todayString }, // apenas hoje ou dias futuros
    })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async create(data: {
    date: Date;
    hour: string;
    duration?: number;
    PT: string;
    athlete: string;
    proposedBy: "PT" | "Athlete" | "Admin";
    details?: string;
  }) {
    if (data.proposedBy === "Admin") data.proposedBy = "PT";
    const existingTraining = await Training.findOne({
      PT: new Types.ObjectId(data.PT),
      athlete: new Types.ObjectId(data.athlete),
      date: data.date,
      hour: data.hour,
      overallStatus: { $in: ["pending", "confirmed"] },
    });
    if (existingTraining) throw new Error("Já existe um treino agendado para esta data e hora.");
    const isSelfProposed = data.PT === data.athlete;

    const training = new Training({
      date: data.date,
      hour: data.hour,
      duration: data.duration ?? 60,
      PT: new Types.ObjectId(data.PT),
      athlete: new Types.ObjectId(data.athlete),
      proposedBy: data.proposedBy,
      ptStatus: data.proposedBy === "PT" ? "accepted" : "proposed",
      athleteStatus: data.proposedBy === "Athlete" ? "accepted" : "proposed",
      overallStatus: isSelfProposed ? "confirmed" : "pending",
      details: data.details || "",
    });

    const notify = data.proposedBy === "PT" ? data.athlete : data.PT;
    const deletedBy = data.proposedBy === "PT" ? data.PT : data.athlete;

    // Busca usuário e settings em paralelo
    const [settings, user] = await Promise.all([
      settingsService.getByUser(notify),
      User.findById(deletedBy)
    ]);

    if (settings.trainingPending) {
      notificationService.createNotification(
        data.proposedBy === "PT" ? data.PT : data.athlete,
        "Novo pedido de treino",
        `Tens um novo pedido de treino em ${formatDate(data.date.toString(), data.hour)}. Proposto por: ${user?.name}.`,
        [notify]
      ).then(res => {
        const targetIds = (res.target || []).map((id: any) => id.toString());
        socketFunction(targetIds, res);
      });
    }

    return training.save();
  },

  async accept(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    let notify, deletedBy;

    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      training.ptStatus = "accepted";
      notify = training.athlete;
      deletedBy = training.PT;
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      training.athleteStatus = "accepted";
      notify = training.PT;
      deletedBy = training.athlete;
    } else throw new Error("User not part of this training");

    if (training.ptStatus === "accepted" && training.athleteStatus === "accepted") {
      training.overallStatus = "confirmed";

      const [settings, user] = await Promise.all([
        settingsService.getByUser(notify.toString()),
        User.findById(deletedBy)
      ]);

      if (settings.trainingApproved) {
        notificationService.createNotification(
          userId,
          "Treino confirmado",
          `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi confirmado por: ${user?.name}.`,
          [notify.toString()]
        ).then(res => {
          const targetIds = (res.target || []).map((id: any) => id.toString());
          socketFunction(targetIds, res);
        });
      }
    }

    return training.save();
  },

  async reject(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    let notify, deletedBy;

    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      training.ptStatus = "rejected";
      notify = training.athlete;
      deletedBy = training.PT;
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      training.athleteStatus = "rejected";
      notify = training.PT;
      deletedBy = training.athlete;
    } else throw new Error("User not part of this training");

    training.overallStatus = "rejected";

    const [settings, user] = await Promise.all([
      settingsService.getByUser(notify.toString()),
      User.findById(deletedBy)
    ]);

    if (settings.trainingRejected) {
      notificationService.createNotification(
        userId,
        "Treino rejeitado",
        `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi rejeitado por: ${user?.name}.`,
        [notify.toString()]
      ).then(res => {
        const targetIds = (res.target || []).map((id: any) => id.toString());
        socketFunction(targetIds, res);
      });
    }

    return training.save();
  },

  async cancel(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    if ((training.PT as Types.ObjectId).equals(userObjectId)) training.ptStatus = "accepted";
    else if ((training.athlete as Types.ObjectId).equals(userObjectId)) training.athleteStatus = "accepted";
    else throw new Error("User not part of this training");

    training.overallStatus = "cancelled";
    return training.save();
  },

  async delete(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    let notify, deletedBy;

    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      notify = training.athlete;
      deletedBy = training.PT;
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      notify = training.PT;
      deletedBy = training.athlete;
    } else throw new Error("User not part of this training");

    if (training.overallStatus === "confirmed") {
      const [settings, user] = await Promise.all([
        settingsService.getByUser(notify.toString()),
        User.findById(deletedBy)
      ]);

     const trainingDateTime = combineDateAndHourLocal(training.date, training.hour);

      const now = new Date();
      const timeDiff = trainingDateTime.getTime() - now.getTime();
      const minutesUntilTraining = Math.round(timeDiff / (1000 * 60));
              console.log(`🕒 Agora: ${now.toISOString()}, Treino: ${trainingDateTime.toISOString()}, Minutos até o treino: ${minutesUntilTraining}`);

      const shouldNotify = settings.trainingCanceled && minutesUntilTraining > 0;

      if (shouldNotify) {
        notificationService.createNotification(
          userId,
          "Treino cancelado",
          `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi cancelado por: ${user?.name}.`,
          [notify.toString()]
        ).then(res => {
          const targetIds = (res.target || []).map((id: any) => id.toString());
          socketFunction(targetIds, res);
        });
      }
    }

    await Training.deleteOne({ _id: trainingId });
    return training; // retorna info do treino excluído
  },

  async getUpcoming(userId: string) {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    return Training.find({
      $or: [{ PT: userId }, { athlete: userId }],
      date: { $gte: startOfToday, $lte: sevenDaysLater },
      overallStatus: "confirmed",
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async getUpcomingFifteenDays(userId: string) {
    const now = new Date();
    const fifteenDaysLater = new Date();
    fifteenDaysLater.setDate(now.getDate() + 15);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    return Training.find({
      $or: [{ PT: userId }, { athlete: userId }],
      date: { $gte: startOfToday, $lte: fifteenDaysLater },
      overallStatus: "confirmed",
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async getAllConfirmed(userId: string) {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    
    return Training.find({
      $or: [{ PT: userId }, { athlete: userId }],
      overallStatus: "confirmed",
      date: { $gte: todayString },
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async getPending(userId: string) {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    return Training.find({
      $or: [{ PT: userId }, { athlete: userId }],
      overallStatus: "pending",
      date: { $gte: todayString },
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async update(
    trainingId: string,
    data: { date?: Date; hour?: string; details?: string; userId: string; PT: string; athlete: string }
  ) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const trainingEdited = { ...training.toObject() }; 
    const notifify = data.userId !== training.PT.toString() ? training.PT.toString() : training.athlete.toString();
    const sender = data.userId !== training.PT.toString() ? training.athlete.toString() : training.PT.toString();

    
    const sendNotification =
      (data.date &&
        new Date(data.date).toISOString().split("T")[0] !==
          new Date(trainingEdited.date).toISOString().split("T")[0]) ||
      (data.hour && data.hour !== trainingEdited.hour);


    if (data.date !== undefined && data.date !== null) training.date = data.date;
    if (data.hour !== undefined && data.hour !== null) training.hour = data.hour;
    if (data.details !== undefined && data.details !== null) training.details = data.details;
    
    // mark as proposed and remove the accepted status from the one who is not editing
    if (data.userId === training.PT.toString()) {
      training.ptStatus = "accepted";
      training.proposedBy = "PT";
      training.athleteStatus = "proposed";
    } else if (data.userId === training.athlete.toString()) {
      training.athleteStatus = "accepted";
      training.proposedBy = "Athlete";
      training.ptStatus = "proposed";
    }

    // If the training was confirmed and is being edited, revert to pending
    if (training.overallStatus === "confirmed" && sendNotification) {
      training.overallStatus = "pending";
    }

    const res = await training.save();

    if (trainingEdited.overallStatus === "confirmed") {
      const settings = await settingsService.getByUser(notifify);
      if (settings.trainingUpdated && sendNotification) {
        notificationService.createNotification(
          sender,
          "Treino alterado",
          `O teu treino em ${formatDate(trainingEdited.date.toString(), trainingEdited.hour)} foi alterado.`,
          [notifify]
        ).then(res => {
          const targetIds = (res.target || []).map((id: any) => id.toString());
          socketFunction(targetIds, res);
        });
      }
    }


    return res;
  },
};

const formatDate = (dateString: string, time: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const weekdays = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  const weekday = weekdays[date.getDay()];
  return `${day}/${month}, ${weekday} às ${time}`;
};

function combineDateAndHourLocal(date: Date, hourString: string): Date {
  // Cria uma data no fuso horário local
  const localDate = new Date(date);
  
  // Usa os componentes de data locais
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();
  
  const [hour, minute] = hourString.split(":").map(Number);
  
  // Cria a data final no fuso horário local
  const trainingDateTime = new Date(year, month, day, hour, minute, 0, 0);
  
  return trainingDateTime;
}