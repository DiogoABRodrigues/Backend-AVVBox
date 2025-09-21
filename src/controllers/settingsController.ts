import { Request, Response } from "express";
import { settingsService } from "../services/settingsService";

export class SettingsController {
  async create(req: Request, res: Response) {
    try {
      const { userId, fifteenMin, thirtyMin, sixtyMin, onetwentyMin } =
        req.body;
      const settings = await settingsService.create(userId, {
        fifteenMin,
        thirtyMin,
        sixtyMin,
        onetwentyMin,
      });
      res.status(201).json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const settings = await settingsService.update(userId, req.body);
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const settings = await settingsService.getByUser(userId);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
