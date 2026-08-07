const express = require('express');
const authRouter = require('./routers/authRouter');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const newsRouter = require('./routers/newsRouter');
const userRouter = require('./routers/userRouter');
const categoryRouter = require('./routers/categoryRouter');
const editorRouter = require('./routers/editorRouter');
const adminRouter = require('./routers/adminRouter');

const app = express();

// parse req body
app.use(cookieParser());
app.use(express.json());
app.use(cors({
 
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin',adminRouter)
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/editors', editorRouter);

module.exports = app;