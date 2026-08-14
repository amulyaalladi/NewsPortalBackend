const User = require('../models/user');
const Notification = require('../models/notification');
const { sendNewsEmail } = require('../utlis/mailer');

const sendNewsNotification = async (news) => {
  try {
    const users = await User.find({ subscribedCategories: news.category });
    if (!users.length) {
      return;
    }

    const recipients = [];
    const message = news.content || news.description || 'A new article has been published.';

    for (const user of users) {
      await sendNewsEmail({
        to: user.email,
        subject: news.title,
        text: `${news.title}\n\n${message}`,
        html: `
          <h2>${news.title}</h2>
          <p>${message}</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/news/${news._id}">Read Full Article</a>
        `,
      });
      recipients.push(user._id);
    }

    await Notification.create({
      title: news.title,
      message,
      news: news._id,
      category: news.category,
      sentTo: recipients,
    });

    console.log('Notification Sent');
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = sendNewsNotification;