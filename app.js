const express = require("express");
const authRoutes = require ("./routes/auth");
const bodyParser = require("body-parser");
const mongoose = require("./config/database");

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

module.exports = app;