#!/usr/bin/env node
'use strict';

// MOVE SERVER LOGIC TO SERVER.JS
// const port = (() => {
//     const args = process.argv;

//     if (args.length !== 3) {
//         console.error("usage: node index.js port");
//         process.exit(1);
//     }

//     const num = parseInt(args[2], 10);
//     if (isNaN(num)) {
//         console.error("error: argument must be an integer.");
//         process.exit(1);
//     }

//     return num;
// })();

const express = require("express");
const cors = require('cors');
const app = express();

app.use(express.json());

// set up cors to allow frontend access to the backend
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// mount routes:
const userRoutes = require('./src/routes/userRoutes');
app.use('/users', userRoutes);

const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

const promoRoutes = require('./src/routes/promotionRoutes');
app.use('/promotions', promoRoutes);

const eventRoutes = require('./src/routes/eventRoutes');
app.use('/events', eventRoutes);

const transactionRoutes = require('./src/routes/transactionRoutes');
app.use('/transactions', transactionRoutes);

// make uploads publicly accessible for the frontend
app.use('/uploads', express.static('uploads'));

// MOVE SERVER LOGIC TO SERVER.JS
// const server = app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

// server.on('error', (err) => {
//     console.error(`cannot start server: ${err.message}`);
//     process.exit(1);
// });

module.exports = app;