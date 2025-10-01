const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    // service: "gmail",
    host: "smtp.gmail.com",   // Gmail SMTP server
    port: 465,                // SSL port
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Tutorby" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
}
module.exports = sendEmail;
