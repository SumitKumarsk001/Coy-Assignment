import fs from "node:fs";
import path from "node:path";
import { profiles } from "./seed.js";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const file = () => process.env.COY_DB_PATH || path.join(process.cwd(), ".data", "db.json");

function load() {
  try { return JSON.parse(fs.readFileSync(file(), "utf8")); }
  catch { return { swipes: {}, matches: [] }; } // swipes: {profileId: {direction, at}}
}
function save(db) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  const tmp = file() + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, file()); // atomic write
}

// Strip server-only fields. This is the single place a profile is shaped for the client.
const publicProfile = ({ likedUser, ...rest }) => rest;

export function getFeed() {
  const { swipes } = load();
  return profiles.filter((p) => !swipes[p.id]).map(publicProfile);
}

export function swipe(targetId, direction) {
  if (!["like", "pass"].includes(direction)) throw new HttpError(400, "direction must be 'like' or 'pass'");
  if (typeof targetId !== "string") throw new HttpError(400, "targetId is required");
  const target = profiles.find((p) => p.id === targetId);
  if (!target) throw new HttpError(404, "Profile not found");

  const db = load();
  if (db.swipes[targetId]) return { match: false, duplicate: true }; // idempotent: first swipe wins

  const at = new Date().toISOString();
  db.swipes[targetId] = { direction, at };
  // Match only when BOTH sides liked. A pass never matches.
  const isMatch = direction === "like" && target.likedUser === true;
  if (isMatch) db.matches.push({ profileId: targetId, at });
  save(db);
  return isMatch ? { match: true, profile: publicProfile(target) } : { match: false };
}

export function getMatches() {
  const { matches } = load();
  return matches
    .map((m) => ({ ...publicProfile(profiles.find((p) => p.id === m.profileId)), matchedAt: m.at }))
    .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}
