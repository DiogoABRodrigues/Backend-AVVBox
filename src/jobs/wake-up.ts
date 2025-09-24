import cron from "node-cron";
import fetch from "node-fetch";

// URL do teu backend
const BACKEND_URL = process.env.BACKEND_URL || "https://backend-avvbox.onrender.com";

// Agendar ping a cada 10 minutos
cron.schedule("*/10 * * * *", async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/wake-up`);
    console.log(`Wake-up ping enviado: ${res.status}`);
  } catch (err) {
    console.log("Erro ao enviar wake-up ping:", err);
  }
});
