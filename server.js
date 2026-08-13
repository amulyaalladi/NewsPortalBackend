//setup mongodb connection

const mongoose=require('mongoose');
const { MONGODB_URI, HOST, PORT } = require('./utlis/config');
const app = require('./app');
const cron = require('node-cron');

mongoose
.connect(MONGODB_URI)
.then(()=>{
    console.log('connected to MongoDB')
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
    app.
    listen(PORT,HOST,()=>{
        console.log(`server is running on http://${HOST}:${PORT}`)
    })
    .on('error',(error)=>{
        console.error('error starting the server:',error.message)
    })
})
.catch((error)=>{
    console.log('error connecting to DB',error.message)
})