import { Training } from "../models/Training";
import { Types } from "mongoose";

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
    });

    return await training.save();
  },

  async accept(trainingId: string, userId: string) {
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

    if (
      training.ptStatus === "accepted" &&
      training.athleteStatus === "accepted"
    ) {
      training.overallStatus = "confirmed";
    }

    return await training.save();
  },

  async reject(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    const userObjectId = new Types.ObjectId(userId);

    if ((training.PT as Types.ObjectId).equals(userObjectId)) {
      training.ptStatus = "rejected";
    } else if ((training.athlete as Types.ObjectId).equals(userObjectId)) {
      training.athleteStatus = "rejected";
    } else {
      throw new Error("User not part of this training");
    }

    training.overallStatus = "rejected";

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

  async delete(trainingId: string) {
    return await Training.findByIdAndDelete(trainingId);
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
};
