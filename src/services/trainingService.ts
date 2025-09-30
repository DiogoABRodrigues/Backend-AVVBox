import { Training } from "../models/Training";
import { Types } from "mongoose";
import { settingsService } from "./settingsService";
import {
  notificationController,
  socketFunction,
} from "../controllers/notificationController";
import { notificationService } from "./notificationService";

export const trainingService = {
  // Buscar treinos de um PT (sem rejeitados)
  async getByPT(ptId: string) {
    return await Training.find({
      PT: new Types.ObjectId(ptId),
      overallStatus: { $ne: "rejected" },
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
    if (data.proposedBy === "Admin") {
      data.proposedBy = "PT"; // Admin cria o treino em nome do PT
    }

    const training = new Training({
      date: data.date,
      hour: data.hour,
      duration: data.duration ?? 60,
      PT: new Types.ObjectId(data.PT),
      athlete: new Types.ObjectId(data.athlete),
      proposedBy: data.proposedBy,
      ptStatus: data.proposedBy === "PT" ? "accepted" : "proposed",
      athleteStatus: data.proposedBy === "Athlete" ? "accepted" : "proposed",
      overallStatus: "pending",
      details: data.details || "",
    });

    let notify;
    let deletedBy;
    if (data.proposedBy === "PT") {
      notify = data.athlete;
      deletedBy = data.PT;
    } else {
      notify = data.PT;
      deletedBy = data.athlete;
    }

    const settings = await settingsService.getByUser(notify);
    if (settings.trainingPending) {
      const res = await notificationService.createNotification(
        data.proposedBy === "PT" ? data.PT : data.athlete,
        "Novo pedido de treino",
        `Tens um novo pedido de treino em ${formatDate(data.date.toString(), data.hour)}. Proposto por: ${deletedBy}.`,
        [notify],
      );

      const targetIds = (res.target || []).map((id: any) => id.toString());
      socketFunction(targetIds, res);
    }

    return await training.save();
  },

  async accept(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    let notify;
    let deletedBy;
    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      training.ptStatus = "accepted";
      notify = training.athlete;
      deletedBy = training.PT;
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      training.athleteStatus = "accepted";
      notify = training.PT;
      deletedBy = training.athlete;
    } else {
      throw new Error("User not part of this training");
    }

    if (
      training.ptStatus === "accepted" &&
      training.athleteStatus === "accepted"
    ) {
      training.overallStatus = "confirmed";
      const settings = await settingsService.getByUser(notify.toString());
      if (settings.trainingApproved) {
        const res = await notificationService.createNotification(
          userId,
          "Treino confirmado",
          `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi confirmado por: ${deletedBy}.`,
          [notify.toString()],
        );

        const targetIds = (res.target || []).map((id: any) => id.toString());
        socketFunction(targetIds, res);
      }
    }

    return await training.save();
  },

  async reject(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    let notify;
    let deletedBy;
    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      training.ptStatus = "rejected";
      notify = training.athlete;
      deletedBy = training.PT;
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      training.athleteStatus = "rejected";
      notify = training.PT;
      deletedBy = training.athlete;
    } else {
      throw new Error("User not part of this training");
    }

    training.overallStatus = "rejected";
    const settings = await settingsService.getByUser(notify.toString());
    if (settings.trainingRejected) {
      const res = await notificationService.createNotification(
        userId,
        "Treino rejeitado",
        `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi rejeitado por: ${deletedBy}.`,
        [notify.toString()],
      );

      const targetIds = (res.target || []).map((id: any) => id.toString());
      socketFunction(targetIds, res);
    }

    return await training.save();
  },

  async cancel(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);

    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      training.ptStatus = "accepted";
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      training.athleteStatus = "accepted";
    } else {
      throw new Error("User not part of this training");
    }

    training.overallStatus = "cancelled";

    return await training.save();
  },

  async delete(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);
    let notify;
    let deletedBy;
    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      notify = training.athlete;
      deletedBy = training.PT;
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      notify = training.PT;
      deletedBy = training.athlete;
    } else {
      throw new Error("User not part of this training");
    }

    if (training.overallStatus == "confirmed") {
      const settings = await settingsService.getByUser(notify.toString());
      if (settings.trainingCanceled) {
        const res = await notificationService.createNotification(
          userId,
          "Treino cancelado",
          `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi cancelado por: ${deletedBy}.`,
          [notify.toString()],
        );

        const targetIds = (res.target || []).map((id: any) => id.toString());
        socketFunction(targetIds, res);
      }
    }

    // apagar mesmo
    Training.deleteOne({ _id: trainingId }).exec();

    return await training.save();
  },

  // Próximos 7 dias
  async getUpcoming(userId: string) {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    // Início do dia de hoje (00:00:00)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const userObjectId = new Types.ObjectId(userId);

    return await Training.find({
      $or: [{ PT: userObjectId }, { athlete: userObjectId }],
      date: { $gte: startOfToday, $lte: sevenDaysLater },
      overallStatus: { $in: ["confirmed"] },
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async getUpcomingFifteenDays(userId: string) {
    const now = new Date();
    const fifteenDaysLater = new Date();
    fifteenDaysLater.setDate(now.getDate() + 15);

    // Início do dia de hoje (00:00:00)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const userObjectId = new Types.ObjectId(userId);

    return await Training.find({
      $or: [{ PT: userObjectId }, { athlete: userObjectId }],
      date: { $gte: startOfToday, $lte: fifteenDaysLater },
      overallStatus: { $in: ["confirmed"] },
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async getPending(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    return await Training.find({
      $or: [{ PT: userObjectId }, { athlete: userObjectId }],
      overallStatus: "pending",
    })
      .sort({ date: 1, hour: 1 })
      .populate("PT", "name email")
      .populate("athlete", "name email");
  },

  async update(
    trainingId: string,
    data: { date?: Date; hour?: string; details?: string; userId: string },
  ) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    let notifify;
    let sender;
    if (training.overallStatus === "confirmed") {
      if (data.userId !== training.PT.toString()) {
        notifify = training.PT.toString();
        sender = training.athlete.toString();
      } else {
        notifify = training.athlete.toString();
        sender = training.PT.toString();
      }

      if (data.details === undefined) {
        const settings = await settingsService.getByUser(notifify);
        if (settings.trainingUpdated) {
          const res = await notificationService.createNotification(
            sender,
            "Treino alterado",
            `O teu treino em ${formatDate(training.date.toString(), training.hour)} foi alterado.`,
            [notifify],
          );

          const targetIds = (res.target || []).map((id: any) => id.toString());
          socketFunction(targetIds, res);
        }
      }
    }

    if (data.date) training.date = data.date;
    if (data.hour) training.hour = data.hour;
    if (data.details) training.details = data.details;

    return await training.save();
  },
};

const formatDate = (dateString: string, time: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const weekday = weekdays[date.getDay()];
  return `${day}/${month}, ${weekday} às ${time}`;
};
