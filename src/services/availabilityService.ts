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
    //checkar se os formatos cumprem HH:MM - HH:MM e se o start é antes do end
    const isValidInterval = (interval: { start: string; end: string }) => {
      const timeFormat = /^\d{2}:\d{2}$/;
      if (!timeFormat.test(interval.start) || !timeFormat.test(interval.end)) {
        return false;
      }
      const start = new Date(`1970-01-01T${interval.start}:00`);
      const end = new Date(`1970-01-01T${interval.end}:00`);
      return start < end;
    };

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    for (const day of days) {
      if (data[day] && data[day].working) {
        for (const interval of data[day].intervals) {
          if (!isValidInterval(interval)) {
            throw new Error(
              `Invalid time interval on ${day}: ${JSON.stringify(interval)}`,
            );
          }
        }
      }
    }

    //order intervals by start time
    for (const day of days) {
      if (data[day] && data[day].working) {
        data[day].intervals.sort(
          (a: { start: string }, b: { start: string }) => {
            return a.start.localeCompare(b.start);
          },
        );
      }
    }

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
      { new: true },
    );
  },

  // Buscar availability pelo PT
  async getByPT(ptId: string) {
    // order by start time?
    return await Availability.findOne({ PT: new Types.ObjectId(ptId) });
  },
};
