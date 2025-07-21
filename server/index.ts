import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createEvent, getEventByCode, confirmGuest, getAdminEvent, masterAdminLogin, getMasterAdminData, deleteEvent, updateEvent } from "./routes/events";
import { initializeDatabase } from "./db";

export function createServer() {
  const app = express();

  // Initialize database
  initializeDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Event routes
  app.post("/api/events", createEvent);
  app.get("/api/events/:code", getEventByCode);
  app.post("/api/events/:code/confirm", confirmGuest);
  app.get("/api/admin/:code", getAdminEvent);

  // Master admin routes
  app.post("/api/master-admin/login", masterAdminLogin);
  app.get("/api/master-admin/events", getMasterAdminData);
  app.delete("/api/master-admin/events/:id", deleteEvent);

  return app;
}
