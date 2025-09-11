import { Request, Response } from "express";
import { userService } from "../services/userService";

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({ message: "Usuário criado com sucesso, verifica o email!", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao criar usuário" });
    }
  },

  async verify(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token inválido" });
      }

      const result = await userService.verifyAccount(token);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao verificar conta" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;
      const user = await userService.login(login, password);
      res.json({ message: "Login bem-sucedido", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao fazer login", error: err });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      let users = await userService.getAll();

      //only the active ones and verified
      users = users.filter(user => user.active && user.verified);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao listar usuários", error: err });
    }
  },

  async getAllIncludingInactive(req: Request, res: Response) {
    try {
      //remove the unverified ones
      let users = await userService.getAll();
      users = users.filter(user => user.verified);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao listar usuários", error: err });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      //not the unverified ones
      const user = await userService.getById(req.params.id);
      if (!user.verified) throw new Error("Usuário não verificado");
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ message: err.message || "Usuário não encontrado", error: err });
    }
  },

  async getAllInactive(req: Request, res: Response) {
    try {
      let users = await userService.getAll();
      //only the inactive ones
      users = users.filter(user => !user.active && user.verified);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao listar usuários inativos", error: err });
    }
  },

  async getMine(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const athletes = await userService.getMyAthletes(userId);
      res.json(athletes);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao listar atletas", error: err });
    }
  },

  async deactivate(req: Request, res: Response) {
    try {
      const user = await userService.deactivate(req.params.id);
      res.json({ message: "Usuário desativado com sucesso", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao desativar usuário", error: err });
    }
  },

  async activate(req: Request, res: Response) {
    try {
      const user = await userService.activate(req.params.id);
      res.json({ message: "Usuário ativado com sucesso", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao ativar usuário", error: err });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao atualizar informações", error: err });
    }
  },
};
