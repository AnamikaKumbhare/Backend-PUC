require('dotenv').config();
const express = require("express");
const http = require("http");
const { connectToMongoDB } = require("./utils/db");
const { Config } = require("./config/config");

const app = express();
const server = http.createServer(app);

const config = new Config().getBaseConfig();

app.use(express.json());

const apiRouter = require("./routes/api");
app.use("/api", apiRouter);

const errorHandler = require("./middlewares/errorMiddleware");
app.use(errorHandler);

connectToMongoDB();

module.exports = { app, server, config };
