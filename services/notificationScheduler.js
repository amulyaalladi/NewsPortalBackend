// Batches up unsent notifications and emails them out on a schedule, for
// users whose notificationFrequency is 'hourly' or 'daily' (as opposed to
// 'immediate', which is handled synchronously in
// notificationController.sendCategoryNotifications).
//
// Requires: npm install node-cron
//
// Import this file ONCE, near where you call app.listen() (e.g. server.js
// or index.js) — NOT in app.js if you keep app.js side-effect-free for
// testing:
//
//   require('./services/notificationScheduler');

const cron = require('node-cron');
const Preference = require('../models/preferences');
const Notification = require('../models/notification');
const { sendEmailNotification } = require('./notificationService');

const runDigest = async (frequency) => {
  try {
    const prefs = await Preference.find({
      notificationChannel: 'email',
      notificationFrequency: frequency,
    }).populate('user');

    for (const pref of prefs) {
      if (!pref.user) continue;

      const pending = await Notification.find({
        user: pref.user._id,
        emailSent: false,
      }).sort({ createdAt: -1 });

      if (!pending.length) continue;

      const listHtml = pending
        .map((n) => `<li><strong>${n.category || 'News'}</strong>: ${n.message}</li>`)
        .join('');

      await sendEmailNotification(
        pref.user.email,
        pref.user.name,
        `Your ${frequency} news digest (${pending.length} update${pending.length > 1 ? 's' : ''})`,
        `<ul>${listHtml}</ul>`
      );

      await Notification.updateMany(
        { _id: { $in: pending.map((n) => n._id) } },
        { $set: { emailSent: true } }
      );
    }
  } catch (error) {
    console.error(`Error running ${frequency} digest:`, error);
  }
};

// Every hour, on the hour
cron.schedule('0 * * * *', () => runDigest('hourly'));

// Once a day at 8am server time
cron.schedule('0 8 * * *', () => runDigest('daily'));

module.exports = { runDigest };