import path from "path";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes";
import bookingRoutes from "./routes/booking.routes";
import organizerRoutes from "./routes/organizer.routes";

/**
 * 🔒 ENV MUST LOAD FIRST
 * This runs BEFORE any other imports that depend on env vars
 */
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import express from "express";
import cors from "cors";
import pool from "./config/db";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/organizer", organizerRoutes);

// Health check
app.get("/", (_req, res) => {
  res.send("Smart Event Planner API is alive 🚀");
});

// Start server only if DB connects
async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connected 🗄️");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed ❌", error);
    process.exit(1);
  }
}

startServer();
