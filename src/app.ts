import * as express from "express";
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import mongoose from "mongoose";
import ApiRouter from './routes/api';

dotenv.config();

if (!process.env.SESSION_SECRET) {
    throw new TypeError("SESSION_SECRET environment variable not set.") // not sure if typeerror is valid, someone please review
}

if (!process.env.MONGODB_URL) {
    throw new TypeError("MONGODB_URL environment variable not set.") // not sure if typeerror is valid, someone please review
}

const app = express();
const port = 6942 // YIPPPEEEEEEEEEEEEEEE!!!!!!!!!!!!!!!!!!

// Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

// Routers
app.use("/api", ApiRouter);

// Settings
app.set("view engine", "pug")

// Startup
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

mongoose.connect(process.env.MONGODB_URL);