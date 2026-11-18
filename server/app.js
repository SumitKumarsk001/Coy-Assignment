import express from "express";
import path from "node:path";
import fs from "node:fs";
import { getFeed, swipe, getMatches } from "./store.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/api/feed", (_req, res) => res.json({ profiles: getFeed() }));
  app.get("/api/matches", (_req, res) => res.json({ matches: getMatches() }));
  app.post("/api/swipe", (req, res) => res.json(swipe(req.body?.targetId, req.body?.direction)));

  // Serve the built React app in production
  const dist = path.join(process.cwd(), "dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.use((req, res, next) => (req.path.startsWith("/api") ? next() : res.sendFile(path.join(dist, "index.html"))));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });
  return app;
}
