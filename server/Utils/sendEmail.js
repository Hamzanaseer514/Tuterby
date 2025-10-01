// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const sendEmail = async (to, subject, htmlContent) => {
//   const transporter = nodemailer.createTransport({
//     // service: "gmail",
//     host: "smtp.gmail.com",   
//     port: 465,                
//     secure: true,
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

// emailService.js
// emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail service simplifies host/port setup
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Verify transporter connection (optional, but recommended)
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to SMTP server:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

// Function to send email
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Tutorby" <${process.env.EMAIL_USER}>`,
      to,            // Recipient email
      subject,       // Email subject
      html: htmlContent, // Email body in HTML
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // re-throw to handle it in your app if needed
  }
};

module.exports = sendEmail;
