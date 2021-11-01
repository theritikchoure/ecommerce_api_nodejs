const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDatabase = ( ) => {
    mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((success) => {
        console.log('MongoDB Connected');
    })
    
}

module.exports = connectDatabase;