//setup mongodb connection

const mongoose=require('mongoose');
const { MONGODB_URI, HOST, PORT } = require('./utlis/config');
const app = require('./app');

mongoose
.connect(MONGODB_URI)
.then(()=>{
    console.log('connected to MongoDB')

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