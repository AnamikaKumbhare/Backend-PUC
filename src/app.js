require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors"); 
const { Server } = require("socket.io");
const { connectToMongoDB } = require("./utils/db");
const { Config } = require("./config/config");

const app = express();
const server = http.createServer(app);

// Updated CORS configuration for Socket.io
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000","http://43.204.97.229:3000"], 
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization", "Content-Type", "X-Request-ID"], // Added X-Request-ID
        credentials: true, 
    }
});

// Updated CORS Middleware for Express
app.use(cors({
    origin: ["http://localhost:3000","http://43.204.97.229:3000"], 
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-ID"], // Added X-Request-ID
    exposedHeaders: ["X-Request-ID"], // Expose the header in responses
    credentials: true 
}));

app.use(express.urlencoded({ extended: true }));
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