// Automatically pulls fresh articles from NewsAPI on a schedule, so you
// never have to manually hit POST /news/fetch-external again. Every time
// this ingests a genuinely new article, storeArticles (in
// newsIngestionService.js) already calls sendCategoryNotifications for
// you — so subscribers get notified automatically too.
//
// Requires: npm install node-cron (same package as notificationScheduler.js
// — if you already installed it for that, you're set)
//
// Import this file ONCE, near where you call app.listen() (e.g. server.js
// or index.js) — alongside notificationScheduler.js:
//
//   require('./services/notificationScheduler');
//   require('./services/newsIngestionScheduler');

const cron = require('node-cron');
const { ingestAllCategories } = require('./newsIngestionService');

// NewsAPI's free tier allows 100 requests/day. Each ingestAllCategories()
// run costs 7 requests (one per category). Running every 3 hours = 8 runs
// x 7 = 56 requests/day, safely under the limit with room for manual
// testing. Adjust the cron string below if your NewsAPI plan differs.
//
// Cron format: minute hour day month weekday
// '0 */3 * * *' = at minute 0, every 3rd hour (00:00, 03:00, 06:00, ...)
const INGESTION_SCHEDULE = '*/2 * * * *';

cron.schedule(INGESTION_SCHEDULE, async () => {
  console.log(`[news-ingestion] Starting scheduled ingestion at ${new Date().toISOString()}`);
  try {
    const results = await ingestAllCategories();
    console.log('[news-ingestion] Completed:', results);
  } catch (error) {
    console.error('[news-ingestion] Scheduled ingestion failed:', error.message);
  }
});

module.exports = {};