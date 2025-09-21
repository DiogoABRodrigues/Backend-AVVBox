import { Request, Response } from "express";
import { userService } from "../services/userService";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) throw new Error("JWT_SECRET não definido");

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const user = await userService.register(req.body);
      res
        .status(201)
        .json({
          message: "Usuário criado com sucesso, verifica o email!",
          user,
        });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao criar usuário" });
    }
  },

  async verify(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).send(`
          <html>
            <head><title>Erro</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: red;">❌ Token inválido</h1>
              <p>O link de confirmação é inválido ou expirou.</p>
            </body>
          </html>
        `);
      }

      await userService.verifyAccount(token);

      return res.send(`
        <html>
          <head>
            <title>Conta Confirmada</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: #f9f9f9; 
                text-align: center; 
                padding: 50px; 
              }
              .card {
                background: white; 
                padding: 20px; 
                border-radius: 10px; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
                display: inline-block;
              }
              h1 { color: #4CAF50; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✅ Conta confirmada com sucesso!</h1>
              <p>Agora já pode entrar na aplicação e fazer login.</p>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      return res.status(400).send(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: red;">❌ Erro</h1>
            <p>${err.message || "Ocorreu um erro ao verificar a conta."}</p>
          </body>
        </html>
      `);
    }
  },

  async resendVerificationEmail(req: Request, res: Response) {
    try {
      console.log("Resend verification email request body:", req.body);
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email inválido" });
      }
      await userService.resendVerificationEmail(email);
      res.json({ message: "Email de verificação reenviado com sucesso" });
    } catch (err: any) {
      res
        .status(400)
        .json({
          message: err.message || "Erro ao reenviar email de verificação",
        });
    }
  },

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email inválido" });
      }
      await userService.requestPasswordReset(email);
      res.json({
        message: "Email de redefinição de senha enviado com sucesso",
      });
    } catch (err: any) {
      res
        .status(400)
        .json({
          message: err.message || "Erro ao solicitar redefinição de senha",
        });
    }
  },

  async resetPasswordWithCode(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      const user = await userService.getByEmail(email);
      if (!user) throw new Error("Usuário não encontrado");

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email inválido" });
      }
      if (!code || code !== user.passwordResetCode) {
        return res
          .status(400)
          .json({ message: "Código de redefinição inválido" });
      }
      if (!newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ message: "Nova senha inválida" });
      }
      await userService.resetPasswordWithCode(email, code, newPassword);
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (err: any) {
      res
        .status(400)
        .json({
          message: err.message || "Erro ao redefinir senha",
          error: err,
        });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;

      const user = await userService.login(login, password);

      // Aqui geramos o JWT com id e role
      const token = jwt.sign(
        { id: user.id.toString(), role: user.role },
        SECRET_KEY,
        { expiresIn: "1d" }, // expira em 1 dia
      );

      // Retorna user + token
      res.json({
        message: "Login bem-sucedido",
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          verified: user.verified,
          active: user.active,
        },
        token,
      });
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Erro ao fazer login", error: err });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      let users = await userService.getAll();

      //only the active ones and verified
      users = users.filter((user) => user.active && user.verified);
      res.json(users);
    } catch (err: any) {
      res
        .status(500)
        .json({
          message: err.message || "Erro ao listar usuários",
          error: err,
        });
    }
  },

  async getAllIncludingInactive(req: Request, res: Response) {
    try {
      //remove the unverified ones
      let users = await userService.getAll();
      users = users.filter((user) => user.verified);
      res.json(users);
    } catch (err: any) {
      res
        .status(500)
        .json({
          message: err.message || "Erro ao listar usuários",
          error: err,
        });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      //not the unverified ones
      const user = await userService.getById(req.params.id);
      if (!user.verified) throw new Error("Usuário não verificado");
      res.json(user);
    } catch (err: any) {
      res
        .status(404)
        .json({ message: err.message || "Usuário não encontrado", error: err });
    }
  },

  async getAllInactive(req: Request, res: Response) {
    try {
      let users = await userService.getAll();
      //only the inactive ones
      users = users.filter((user) => !user.active && user.verified);
      res.json(users);
    } catch (err: any) {
      res
        .status(500)
        .json({
          message: err.message || "Erro ao listar usuários inativos",
          error: err,
        });
    }
  },

  async getMine(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      let athletes = await userService.getMyAthletes(userId);
      athletes = athletes.filter((user) => user.active && user.verified);
      res.json(athletes);
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message || "Erro ao listar atletas", error: err });
    }
  },

  async deactivate(req: Request, res: Response) {
    try {
      const user = await userService.deactivate(req.params.id);
      res.json({ message: "Usuário desativado com sucesso", user });
    } catch (err: any) {
      res
        .status(400)
        .json({
          message: err.message || "Erro ao desativar usuário",
          error: err,
        });
    }
  },

  async activate(req: Request, res: Response) {
    try {
      const user = await userService.activate(req.params.id);
      res.json({ message: "Usuário ativado com sucesso", user });
    } catch (err: any) {
      res
        .status(400)
        .json({ message: err.message || "Erro ao ativar usuário", error: err });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(user);
    } catch (err: any) {
      res
        .status(400)
        .json({
          message: err.message || "Erro ao atualizar informações",
          error: err,
        });
    }
  },

  async getStaff(req: Request, res: Response) {
    try {
      const users = await userService.getStaff();
      res.json(users);
    } catch (err: any) {
      res
        .status(500)
        .json({
          message: err.message || "Erro ao listar usuários",
          error: err,
        });
    }
  },
};
