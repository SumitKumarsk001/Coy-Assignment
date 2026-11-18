import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { createApp } from "../server/app.js";
import { profiles } from "../server/seed.js";

let server, base;
const likedMe = profiles.find((p) => p.likedUser).id;
const post = (body, raw) => fetch(`${base}/api/swipe`, { method: "POST", headers: { "content-type": "application/json" }, body: raw ?? JSON.stringify(body) });

beforeEach(async () => {
  process.env.COY_DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-")), "db.json");
  await new Promise((r) => { server = createApp().listen(0, r); });
  base = `http://localhost:${server.address().port}`;
});
afterEach(() => new Promise((r) => server.close(r)));

describe("HTTP API", () => {
  it("GET /api/feed never exposes who liked the user", async () => {
    const text = await (await fetch(`${base}/api/feed`)).text();
    expect(text).not.toMatch(/likedUser|likedYou|likesMe/i);
    expect(JSON.parse(text).profiles).toHaveLength(profiles.length);
  });
  it("POST /api/swipe creates a match, and GET /api/matches lists it", async () => {
    const r = await (await post({ targetId: likedMe, direction: "like" })).json();
    expect(r.match).toBe(true);
    const m = await (await fetch(`${base}/api/matches`)).json();
    expect(m.matches.map((x) => x.id)).toEqual([likedMe]);
  });
  it("swiped profiles leave the feed", async () => {
    await post({ targetId: "p2", direction: "pass" });
    const f = await (await fetch(`${base}/api/feed`)).json();
    expect(f.profiles.find((p) => p.id === "p2")).toBeUndefined();
  });
  it("400 on bad direction, 404 on unknown profile, 400 on bad JSON", async () => {
    expect((await post({ targetId: "p1", direction: "love" })).status).toBe(400);
    expect((await post({ targetId: "nope", direction: "like" })).status).toBe(404);
    expect((await post(null, "{oops")).status).toBe(400);
  });
});
