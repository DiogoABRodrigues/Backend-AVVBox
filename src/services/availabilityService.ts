import { Availability } from "../models/Availability";
import { Types } from "mongoose";

export const availabilityService = {
  // Criar um novo availability
  async create(data: any) {
    const avail = new Availability({
      PT: new Types.ObjectId(data.PT),
      Monday: data.Monday || { working: true, intervals: [] },
      Tuesday: data.Tuesday || { working: true, intervals: [] },
      Wednesday: data.Wednesday || { working: true, intervals: [] },
      Thursday: data.Thursday || { working: true, intervals: [] },
      Friday: data.Friday || { working: true, intervals: [] },
      Saturday: data.Saturday || { working: false, intervals: [] },
      Sunday: data.Sunday || { working: false, intervals: [] },
      maxAthletesPerHour: data.maxAthletesPerHour || 1,
    });
    return await avail.save();
  },

  // Atualizar availability existente pelo _id
  async update(id: string, data: any) {
    return await Availability.findByIdAndUpdate(
      id,
      {
        $set: {
          Monday: data.Monday || { working: true, intervals: [] },
          Tuesday: data.Tuesday || { working: true, intervals: [] },
          Wednesday: data.Wednesday || { working: true, intervals: [] },
          Thursday: data.Thursday || { working: true, intervals: [] },
          Friday: data.Friday || { working: true, intervals: [] },
          Saturday: data.Saturday || { working: false, intervals: [] },
          Sunday: data.Sunday || { working: false, intervals: [] },
          maxAthletesPerHour: data.maxAthletesPerHour,
        },
      },
      { new: true }
    );
  },

  // Buscar availability pelo PT
  async getByPT(ptId: string) {
    return await Availability.findOne({ PT: new Types.ObjectId(ptId) });
  },
};
