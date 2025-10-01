const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  // Multiple configurations to try for different deployment environments
  const configs = [
    // Configuration 1: Port 587 (STARTTLS) - Most commonly allowed on cloud platforms
    {
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // false for 587, true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
    // Configuration 2: Port 465 (SSL) - Original configuration
    {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
    // Configuration 3: Port 25 (if others are blocked)
    {
      host: "smtp.gmail.com",
      port: 25,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }
  ];

  let transporter;
  let lastError;

  // Try each configuration until one works
  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`Trying email configuration ${i + 1}...`);
      transporter = nodemailer.createTransport(configs[i]);
      
      // Verify the connection
      await transporter.verify();
      console.log(`Email configuration ${i + 1} verified successfully`);
      break;
    } catch (error) {
      console.log(`Email configuration ${i + 1} failed:`, error.message);
      lastError = error;
      
      if (i === configs.length - 1) {
        console.error("All email configurations failed");
        throw new Error(`Email service unavailable: ${lastError.message}`);
      }
    }
  }

  try {
    await transporter.sendMail({
      from: `"Tuterby" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

module.exports = sendEmail;
