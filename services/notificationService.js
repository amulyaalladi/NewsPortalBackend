const axios = require('axios');
const User = require('../models/user');
const Notification = require('../models/notification');
const { sendNewsEmail } = require('../utlis/mailer');

const sendEmailNotification = async (recipientEmail, recipientName, subject, htmlContent) => {
  try {
    // 1. Ensure recipient email is a string, not an object
    const emailStr = typeof recipientEmail === 'object' ? recipientEmail.email : recipientEmail;

    if (!emailStr) {
      console.error("Skipping email: No valid recipient email address provided.");
      return;
    }

    // 2. Brevo API payload REQUIRES 'to' to be an array of objects
    const payload = {
      sender: {
        name: "News Portal",
        email: process.env.SENDER_EMAIL || "noreply@yourdomain.com"
      },
      to: [
        {
          email: emailStr,
          name: recipientName || "Subscriber"
        }
      ],
      subject: subject || "Latest News Update",
      htmlContent: htmlContent || "<p>You have new news updates!</p>"
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`Email successfully sent to ${emailStr}`);
    return response.data;
  } catch (error) {
    console.error("Brevo API Error:", error.response?.data || error.message);
    // Don't rethrow if you don't want it to crash the background job
  }
};

module.exports = { sendEmailNotification };