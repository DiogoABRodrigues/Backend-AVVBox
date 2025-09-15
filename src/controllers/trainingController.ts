import { Request, Response } from "express";
import { trainingService } from "../services/trainingService";

export class TrainingController {
  async create(req: Request, res: Response) {
    try {
      const { date, hour, duration, PT, athlete, proposedBy } = req.body;
      const training = await trainingService.create({
        date,
        hour,
        duration,
        PT,
        athlete,
        proposedBy,
      });
      res.status(201).json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // quem está a aceitar
      const training = await trainingService.accept(id, userId);
      res.json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // quem está a rejeitar
      const training = await trainingService.reject(id, userId);
      res.json(training);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await trainingService.delete(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
