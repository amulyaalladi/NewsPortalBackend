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

module.exports = { sendNewsEmail };