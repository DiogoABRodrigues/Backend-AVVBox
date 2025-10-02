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
      const { athleteId, group, name, weight, reps, sets, details } = req.body;
      if (!name) throw new Error("Nome do exercício é obrigatório");
      const result = await exerciseService.createExercise(
        athleteId,
        group,
        name,
        weight,
        reps,
        sets,
        details,
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const {
        _id,
        athleteId,
        group,
        exerciseName,
        newWeight,
        reps,
        sets,
        details,
      } = req.body;
      const result = await exerciseService.updateExercise(
        _id,
        athleteId,
        group,
        exerciseName,
        newWeight,
        reps,
        sets,
        details,
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { athleteId, group, _id } = req.body;
      const result = await exerciseService.deleteExercise(
        athleteId,
        group,
        _id,
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByAthlete(req: Request, res: Response) {
    try {
      const { athleteId } = req.params;
      const result = await exerciseService.getByAthlete(athleteId);
      if (!result)
        return res.status(404).json({ message: "Atleta não encontrado" });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
