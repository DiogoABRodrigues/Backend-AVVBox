import { Request, Response } from "express";
import { exerciseService } from "../services/exerciseService";

export class ExerciseController {

  async createWeights(req: Request, res: Response) {
    try {
      const { athleteId } = req.body;
        const result = await exerciseService.create(athleteId);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}  
  async create(req: Request, res: Response) {
    try {
      const { athleteId, group, name, weight, reps, sets } = req.body;
      const result = await exerciseService.createExercise(athleteId, group, name, weight, reps, sets);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { athleteId, group, exerciseName, newWeight, reps, sets } = req.body;
      const result = await exerciseService.updateExercise(athleteId, group, exerciseName, newWeight, reps, sets);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { athleteId, group, exerciseName } = req.body;
      const result = await exerciseService.deleteExercise(athleteId, group, exerciseName);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByAthlete(req: Request, res: Response) {
    try {
      const { athleteId } = req.params;
      const result = await exerciseService.getByAthlete(athleteId);
      if (!result) return res.status(404).json({ message: "Atleta não encontrado" });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
