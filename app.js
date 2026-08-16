const express = require('express');
const authRouter = require('./routers/authRouter');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const newsRouter = require('./routers/newsRouter');
const userRouter = require('./routers/userRouter');
const categoryRouter = require('./routers/categoryRouter');
const editorRouter = require('./routers/editorRouter');
const adminRouter = require('./routers/adminRouter');
const notificationRouter=require('./routers/notificationRouter')
const PreferencesRoutes=require('./routers/PreferencesRoutes');


const app = express();

// parse req body
app.use(cookieParser());
app.use(express.json());


// app.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://realtimenews1.netlify.app'
];

// Matches any deploy-preview/branch subdomain Netlify generates for this
// site, e.g. https://6a81956c9581730008c1d78f--realtimenews1.netlify.app
const netlifyPreviewPattern = /^https:\/\/[a-z0-9-]+--realtimenews1\.netlify\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman/curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || netlifyPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin',adminRouter);
app.use('/api/v1/preferences',PreferencesRoutes);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/editors', editorRouter);

// GET /health — deliberately does no DB work and needs no auth, so it's
// as fast and lightweight as possible. Point a frequent (every 5-10 min)
// cron-job.org job at this to keep the Render free-tier instance from
// spinning down, so the heavier /news/fetch-external job always hits an
// already-warm server instead of triggering a slow cold start.
app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok', uptime: process.uptime() });
});

module.exports = app;