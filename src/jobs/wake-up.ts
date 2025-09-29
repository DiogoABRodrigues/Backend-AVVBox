import cron from "node-cron";
import fetch from "node-fetch";
import { API_BASE_URL } from "../../config";

// URL do teu backend
const BACKEND_URL = API_BASE_URL;

// Agendar ping a cada 10 minutos
cron.schedule("*/10 * * * *", async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/users/wake-up`);
    console.log(`Wake-up ping enviado: ${res.status}`);
  } catch (err) {
    console.log("Erro ao enviar wake-up ping:", err);
  }
});