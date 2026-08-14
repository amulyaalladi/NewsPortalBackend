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

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman/curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
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


module.exports = app;