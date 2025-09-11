import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailService = {
  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `http://192.168.1.184:3000/users/verify?token=${token}`;

    await transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to: email,
      subject: "RC app - Confirma a tua conta",
      html: `
        <h3>Bem-vindo!</h3>
        <p>Clica no link para verificar a tua conta:</p>
        <a href="${verificationLink}">Clica aqui.</a>
      `,
    });
  },
};
