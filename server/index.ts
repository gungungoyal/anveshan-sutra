import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSearch, handleGetOrganization } from "./routes/search";
import { handleSubmitOrganization } from "./routes/submit";
import { handleSignup, handleLogin, handleGetCurrentUser } from "./routes/auth";
import {
  handleGetMatches,
  handleExcludeMatch,
  handleGetFocusAreas,
  handleGetRegions,
} from "./routes/matches";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/me", handleGetCurrentUser);

  // Organization routes
  app.post("/api/orgs/submit", handleSubmitOrganization);
  app.get("/api/orgs/search", handleSearch);
  app.get("/api/orgs/:id", handleGetOrganization);

  // Match & recommendation routes
  app.get("/api/matches/recommendations", handleGetMatches);
  app.post("/api/matches/:org_a_id/:org_b_id/exclude", handleExcludeMatch);

  // Filter/metadata routes
  app.get("/api/focus-areas", handleGetFocusAreas);
  app.get("/api/regions", handleGetRegions);

  return app;
}
