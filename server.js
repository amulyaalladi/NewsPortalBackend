//setup mongodb connection

const mongoose = require('mongoose');
const { MONGODB_URI, HOST, PORT } = require('./utlis/config');
const app = require('./app');
const { ingestAllCategories } = require('./services/newsIngestionService');

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

    // NOTE: news ingestion is now triggered externally via cron-job.org
    // hitting POST /api/v1/news/fetch-external on a schedule. This also
    // has the side benefit of keeping a Render free-tier service awake,
    // which an in-process cron job can't do (it only runs while the
    // server happens to already be up).
    //
    // Do NOT also require('./services/newsIngestionScheduler') here —
    // running both means every ingestion happens twice, doubling your
    // NewsAPI request usage and risking the free tier's 100/day limit.
    // Pick ONE: either cron-job.org (current choice) or the in-process
    // scheduler, never both.

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