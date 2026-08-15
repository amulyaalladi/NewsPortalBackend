const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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

const sendForgotPasswordEmail = async (toEmail, resetUrl) => {
  try {
    const payload = {
      sender: {
        name: process.env.SENDER_NAME || 'Daily Pulse',
        email: process.env.SENDER_EMAIL
      },
      to: [{ email: toEmail }],
      subject: '🔒 Reset Your Password - Daily Pulse',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">Daily Pulse</h2>
          <h3>Password Reset Request</h3>
          <p>We received a request to reset your password. Click the button below to set a new password for your account:</p>
          
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a>
          </p>
          
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `
    };

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout:8000
    });

    console.log(`✅ Password reset email sent to ${toEmail} | Message ID: ${response.data.messageId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Brevo API Error (Reset Password) for ${toEmail}:`, error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  sendNewsEmail,
  sendForgotPasswordEmail
};