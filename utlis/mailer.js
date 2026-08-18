const axios = require('axios');
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const nodemailer = require("nodemailer");

// 1. Define the transporter using your SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your app password or SMTP password
  },
});

/**
 * Sends transactional news emails via Brevo v3 HTTP API
 * @param {string} toEmail - Recipient email address
 * @param {Array} articles - Array of article objects
 */
const sendNewsEmail = async (toEmail, articles) => {
  try {
    // 1. Generate HTML list of articles
    const articleListHtml = articles.map(article => `
      <div style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
        <h3 style="margin: 0 0 8px 0;">
          <a href="${article.url || '#'}" style="color: #0284c7; text-decoration: none;">
            ${article.title}
          </a>
        </h3>
        <p style="color: #334155; margin: 0 0 8px 0;">${article.content || article.description || ''}</p>
        <span style="background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
          Category: <strong>${article.category}</strong>
        </span>
      </div>
    `).join('');

    // 2. Build Brevo API Request Payload
    const payload = {
      sender: {
        name: process.env.SENDER_NAME || 'News Portal Alerts',
        email: process.env.SENDER_EMAIL // Must be verified in Brevo
      },
      to: [
        {
          email: toEmail
        }
      ],
      subject: '📰 New Articles Match Your Subscribed Topics!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2>Latest Updates For You</h2>
          <p>Here are the fresh news updates based on your preferences:</p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 16px 0;" />
          ${articleListHtml}
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            You are receiving this email based on your news subscription preferences.
          </p>
        </div>
      `
    };

    // 3. Send HTTP POST request to Brevo
    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`✅ Email sent to ${toEmail} | Message ID: ${response.data.messageId}`);
    return response.data;

  } catch (error) {
    // Detailed error logging for debugging API issues
    console.error(`❌ Brevo API Error for ${toEmail}:`, error.response?.data || error.message);
  }
  
};

const sendForgotPasswordEmail = async (toEmail, resetUrl, name = "") => {
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <h2 style="color: #111827;">Reset your password</h2>
    <p style="color: #374151; font-size: 14px;">
      Hi${name ? " " + name : ""}, we received a request to reset your password.
      Click the button below to choose a new one. This link will expire in 1 hour.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}"
         style="background-color: #4f46e5; color: #ffffff; text-decoration: none;
                padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;
                display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #6b7280; font-size: 12px;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
    </p>
    <p style="color: #6b7280; font-size: 12px;">
      If you didn't request this, you can safely ignore this email — your password will remain unchanged.
    </p>
  </div>
  `;
 
  await transporter.sendMail({
    from: `"Support" <${SMTP_USER}>`,
    to: toEmail,
    subject: "Reset your password",
    html,
  });
};

module.exports = {
  sendNewsEmail,
  sendForgotPasswordEmail
};