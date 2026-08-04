const nodemailer = require('nodemailer');
require('dotenv').config();
import {EMAIL_USER,EMAIL_PASS} from '../utlis/config'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendSubscriptionEmail = async ({ to, subject, text, html }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email credentials not configured. Skipping email send.');
    return;
  }

  const mailOptions = {
    from: `"News Portal" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendSubscriptionEmail };