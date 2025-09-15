import { Training } from "../models/Training";
import { Types } from "mongoose";

export const trainingService = {
  async create(data: {
    date: Date;
    hour: string;
    duration?: number;
    PT: string;
    athlete: string;
    proposedBy: "PT" | "Athlete";
  }) {
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

    if (training.PT == (userId)) {
      training.ptStatus = "accepted";
    } else if (training.athlete == (userId)) {
      training.athleteStatus = "accepted";
    } else {
      throw new Error("User not part of this training");
    }

    if (training.ptStatus === "accepted" && training.athleteStatus === "accepted") {
      training.overallStatus = "confirmed";
    }

    return await training.save();
  },

  async reject(trainingId: string, userId: string) {
    const training = await Training.findById(trainingId);
    if (!training) throw new Error("Training not found");

    if (training.PT == (userId)) {
      training.ptStatus = "rejected";
    } else if (training.athlete == (userId)) {
      training.athleteStatus = "rejected";
    } else {
      throw new Error("User not part of this training");
    }

    training.overallStatus = "rejected";

    return await training.save();
  },

  async delete(trainingId: string) {
    return await Training.findByIdAndDelete(trainingId);
  },
};
