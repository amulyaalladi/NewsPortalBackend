const Notification = require('../models/notification');
const User = require('../models/user');
const { sendSubscriptionEmail } = require('../utlis/mailer');

const notificationController = {
  createNotification: async (request, response) => {
    try {
      const { title, message, news, category, sentTo = [] } = request.body;

      const notification = await Notification.create({
        title,
        message,
        news,
        category,
        sentTo,
      });

      return response.status(201).json({ message: 'Notification created', result: notification });
    } catch (error) {
      return response.status(500).json({ message: error.message });
    }
  },

  sendCategoryNotifications: async (newsItem) => {
    try {
      const subscribers = await User.find({ subscribedCategories: newsItem.category }).select('email name');

      if (!subscribers.length) return;

      const subject = `New ${newsItem.category} update: ${newsItem.title}`;
      const text = `${newsItem.title}\n\n${newsItem.content}`;
      const html = `<h3>${newsItem.title}</h3><p>${newsItem.content}</p>`;

      const emailPromises = subscribers.map((user) =>
        sendSubscriptionEmail({
          to: user.email,
          subject,
          text: `${text}\n\nHello ${user.name || 'reader'}, this update matches your subscribed category.`,
          html: `${html}<p>Hello ${user.name || 'reader'}, this update matches your subscribed category.</p>`,
        })
      );

      await Promise.all(emailPromises);

      await Notification.create({
        title: subject,
        message: text,
        news: newsItem._id,
        category: newsItem.category,
        sentTo: subscribers.map((user) => user._id),
      });
    } catch (error) {
      console.error('Failed to send category notifications:', error.message);
    }
  },
};

module.exports = notificationController;