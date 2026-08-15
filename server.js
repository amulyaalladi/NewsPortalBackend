//setup mongodb connection

const mongoose = require('mongoose');
const { MONGODB_URI, HOST, PORT } = require('./utlis/config');
const app = require('./app');
const cron = require('node-cron');
const axios = require('axios');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');

    const autoSeedIfEmpty = async () => {
      try {
        const News = require('./models/news');
        const count = await News.countDocuments();
        if (count === 0) {
          console.log('Database empty on startup! Fetching initial news batch...');
          await ingestAllCategories();
          console.log('Initial news fetch completed!');
        }
      } catch (err) {
        console.error('Initial news seed error:', err.message);
      }
    };

    autoSeedIfEmpty();
    require('./services/notificationScheduler');
    require('./services/newsIngestionScheduler');

    // -------------------------------------------------------------
    // HOURLY NEWS INGESTION CRON JOB
    // -------------------------------------------------------------
    const CATEGORIES = [
      'General',
      'Health',
      'Science',
      'Business',
      'Technology',
      'Sports',
      'Entertainment'
    ];

    cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running hourly multi-category news ingestion...');
      try {
        for (const category of CATEGORIES) {
          console.log(`fetching news for category: ${category}...`);
          await axios.get(
            `https://newsportalbackend-oatr.onrender.com/api/v1/news/fetch-external?category=${category}`
          );
        }
        console.log('✅ Hourly news fetch for all categories completed.');
      } catch (error) {
        console.error('❌ Hourly news fetch failed:', error.message);
      }
    });

    app
      .listen(PORT, HOST, () => {
        console.log(`server is running on http://${HOST}:${PORT}`);
      })
      .on('error', (error) => {
        console.error('error starting the server:', error.message);
      });
  })
  .catch((error) => {
    console.log('error connecting to DB', error.message);
  });