require('dotenv').config();

const MONGODB_URI= process.env.MONGODB_URI;
const ENV= process.env.ENV;
const HOST= process.env.HOST;
const PORT= process.env.PORT
const SALT_ROUNDS=process.env.SALT_ROUNDS;
const JWT_SECRET=process.env.JWT_SECRET;
const SMTP_USER=process.env.SMTP_USER;
const SMTP_PASS=process.env.SMTP_PASS;
const NEWS_API_KEY=process.env.NEWS_API_KEY;
const NEWS_API_URL=process.env.NEWS_API_URL;
const CLIENT_URL=process.env.CLIENT_URL;                                                                        
module.exports={
    MONGODB_URI,
    ENV,
    HOST,
    PORT,
    SALT_ROUNDS,
    JWT_SECRET,
    SMTP_USER,
    SMTP_PASS,
    NEWS_API_KEY,
    NEWS_API_URL,
    CLIENT_URL
}