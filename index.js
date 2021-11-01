const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const connectDatabase = require('./config/database');

// Middleware Imports
const errorMiddleware = require('./middleware/error');

// Hadnling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting Down the Server due to Uncaught Exception');

    process.exit(1);
})

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

// Connecting To Database
connectDatabase();

// Routes Imports
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const orderRoute = require('./routes/orderRoute');

app.use('/api/v1', productRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', orderRoute);

app.use(errorMiddleware);

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is Running at ${process.env.PORT}`);
})

// Unhandled Promise Rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting Down Server due to Unhandled Promise Rejection');

    server.close(() => {
        process.exit(1);
    });
})