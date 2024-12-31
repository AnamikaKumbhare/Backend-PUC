require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors"); 
const { Server } = require("socket.io");
const { connectToMongoDB } = require("./utils/db");
const { Config } = require("./config/config");

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization", "Content-Type"], 
        credentials: true, 
    }
});

// CORS Middleware to allow requests from the frontend (localhost:3000)
app.use(cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"], 
    credentials: true 
}));

const config = new Config().getBaseConfig();

app.use(express.json());

const apiRouter = require("./routes/api");
app.use("/api", apiRouter);

const errorHandler = require("./middlewares/errorMiddleware");
app.use(errorHandler);

// Initialize WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Connect to MongoDB
connectToMongoDB();

module.exports = { app, server, config, io };
