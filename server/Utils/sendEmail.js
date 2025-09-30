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
  console.log(`📧 Attempting to send email to: ${to}`);
  console.log(`📝 Subject: ${subject}`);
  
  // Multiple email configurations to try
  const emailConfigs = [
    // Configuration 1: Gmail with port 465 (SSL)
    {
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      timeout: 15000,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
    },
    // Configuration 2: Gmail with port 587 (TLS)
    {
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      timeout: 15000,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    },
    // Configuration 3: Gmail service (fallback)
    {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      timeout: 15000,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
    },
    // Configuration 4: Alternative SMTP settings
    {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      timeout: 20000,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
    },
  ];

  let lastError = null;
  let success = false;

  for (let i = 0; i < emailConfigs.length; i++) {
    try {
      console.log(`🔄 Trying email configuration ${i + 1}/${emailConfigs.length}`);
      
      const transporter = nodemailer.createTransporter(emailConfigs[i]);
      
      // Verify connection before sending
      console.log(`🔍 Verifying connection for config ${i + 1}...`);
      await transporter.verify();
      console.log(`✅ Configuration ${i + 1} verified successfully`);

      // Send email
      const info = await transporter.sendMail({
        from: `"Tutorby" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`✅ Email sent successfully using configuration ${i + 1}`);
      console.log(`📧 Message ID: ${info.messageId}`);
      console.log(`📧 Response: ${info.response}`);
      
      success = true;
      return info;

    } catch (error) {
      console.error(`❌ Configuration ${i + 1} failed:`, error.message);
      console.error(`❌ Error code: ${error.code}`);
      console.error(`❌ Error command: ${error.command}`);
      
      lastError = error;
      
      // If this is not the last configuration, try the next one
      if (i < emailConfigs.length - 1) {
        console.log(`🔄 Trying next email configuration...`);
        // Wait a bit before trying next configuration
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // If all configurations failed, provide detailed error information
  console.error("❌ All email configurations failed!");
  console.error("🔍 Last error details:", {
    message: lastError?.message,
    code: lastError?.code,
    command: lastError?.command,
    response: lastError?.response,
  });

  // Provide specific guidance based on error type
  if (lastError?.code === 'ECONNECTION' || lastError?.code === 'ETIMEDOUT') {
    console.error("🔍 CONNECTION TIMEOUT - Possible solutions:");
    console.error("   1. Check if SMTP ports (465, 587) are open in your hosting provider");
    console.error("   2. Verify network connectivity to Gmail servers");
    console.error("   3. Contact your hosting provider about SMTP restrictions");
    console.error("   4. Consider using alternative email service (SendGrid, Mailgun)");
    console.error("   5. Check firewall settings in deployment environment");
  } else if (lastError?.code === 'EAUTH') {
    console.error("🔍 AUTHENTICATION FAILED - Check:");
    console.error("   1. EMAIL_USER and EMAIL_PASS environment variables are set correctly");
    console.error("   2. Use Gmail App Password (not regular password)");
    console.error("   3. Enable 2-Factor Authentication and generate App Password");
    console.error("   4. Check 'Less secure app access' settings in Gmail");
  } else if (lastError?.code === 'ENOTFOUND') {
    console.error("🔍 DNS RESOLUTION FAILED - Check:");
    console.error("   1. Internet connectivity in deployment environment");
    console.error("   2. DNS settings");
    console.error("   3. SMTP host configuration");
  }

  // Don't throw error to prevent app crashes - just log and return null
  console.error("⚠️ Email sending failed, but application will continue");
  return null;
};

module.exports = sendEmail;

