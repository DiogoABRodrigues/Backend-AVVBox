import { Measures } from "../models/Measures";

export const measuresService = {
  async createMeasure(data: any) {
    const measure = new Measures(data);
    return await measure.save();
  },

  async getAllMeasuresByUser(userId: string) {
    return await Measures.find({ user: userId, type: 'atual'  }).sort({ date: -1 });
  },
  //return just the last measure of type 'atual'
  async getAtualByUser(userId: string) {
    return await Measures.findOne({ user: userId, type: 'atual'  }).sort({ date: -1 });
  },

  async getLastByUser(userId: string) {
    return await Measures.findOne({ user: userId, type: 'atual' })
      .sort({ date: -1 }) // ordenar mais recentes primeiro
      .skip(1)            // saltar o mais recente
      .exec();
  },

  async getGoalMeasuresByUser(userId: string) { 
    return await Measures.findOne({ user: userId, type: 'goal' }).sort({ date: -1 });
  },

  async updateMeasure(measureId: string, data: any) {
    return await Measures.findByIdAndUpdate(measureId, data, { new: true });
  },

  async deleteMeasure(measureId: string) {
    const measure = await Measures.findById(measureId);
    if (!measure) {
      return null;
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (measure.type === 'atual' && measure.date >= thirtyDaysAgo) {
      return await Measures.findByIdAndDelete(measureId);
    }
    return null;
  }
};
