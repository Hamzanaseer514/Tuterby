// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const sendEmail = async (to, subject, htmlContent) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"Tutorby" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html: htmlContent,
//   });
// }
// module.exports = sendEmail;
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`📧 Sending email to: ${to}`);

    // Transporter config (Gmail + App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g. jeondavid00@gmail.com
        pass: process.env.EMAIL_PASS, // 16-digit Gmail App Password
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Tutorby" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);

    // Helpful hints based on error
    if (err.code === "EAUTH") {
      console.error("👉 Check EMAIL_USER / EMAIL_PASS (App Password required).");
    } else if (err.code === "ETIMEDOUT") {
      console.error("👉 Your hosting provider may be blocking Gmail SMTP ports (465/587).");
    } else if (err.code === "ENOTFOUND") {
      console.error("👉 DNS/SMTP host not reachable. Check internet / DNS settings.");
    }

    throw err;
  }
};

module.exports = sendEmail;
