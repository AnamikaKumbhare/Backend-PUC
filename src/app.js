require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectToMongoDB } = require("./utils/db");
const { Config } = require("./config/config");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Update this with your frontend URL
        methods: ["GET", "POST"]
    }
});

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

    // Add any specific socket event handlers here if needed
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

connectToMongoDB();

module.exports = { app, server, config, io };