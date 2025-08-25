const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);

// Simple CORS setup - allows your domain
app.use(
  cors({
    origin: "https://invoice.rspos.dev",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
    ],
    optionsSuccessStatus: 200,
  })
);

// Handle preflight requests for all routes
app.options("*", cors()); // Enable preflight for all routes

app.use(express.json());

// Add explicit OPTIONS handler before routes
app.use("/api/*", (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "https://invoice.rspos.dev");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/api/auth", authRoutes);

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("DB connected");
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
};

const startServer = async () => {
  try {
    await dbConnect();
    server.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
