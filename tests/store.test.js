import { describe, it, expect, beforeEach } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { getFeed, swipe, getMatches } from "../server/store.js";
import { profiles } from "../server/seed.js";

const likedMe = profiles.find((p) => p.likedUser).id;
const notLikedMe = profiles.find((p) => !p.likedUser).id;

beforeEach(() => {
  process.env.COY_DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-")), "db.json");
});

describe("matching", () => {
  it("liking a profile that already liked you creates a match", () => {
    const r = swipe(likedMe, "like");
    expect(r.match).toBe(true);
    expect(getMatches().map((m) => m.id)).toEqual([likedMe]);
  });
  it("liking a profile that did not like you creates no match", () => {
    expect(swipe(notLikedMe, "like").match).toBe(false);
    expect(getMatches()).toHaveLength(0);
  });
  it("a pass never creates a match, even if they liked you", () => {
    expect(swipe(likedMe, "pass").match).toBe(false);
    expect(getMatches()).toHaveLength(0);
  });
});

describe("feed", () => {
  it("excludes swiped profiles (like and pass)", () => {
    swipe(likedMe, "like"); swipe(notLikedMe, "pass");
    const ids = getFeed().map((p) => p.id);
    expect(ids).not.toContain(likedMe);
    expect(ids).not.toContain(notLikedMe);
    expect(ids).toHaveLength(profiles.length - 2);
  });
});

describe("swipe", () => {
  it("is idempotent: repeating a swipe changes nothing", () => {
    swipe(likedMe, "like");
    const again = swipe(likedMe, "like");
    expect(again.match).toBe(false);
    expect(getMatches()).toHaveLength(1);
  });
  it("first swipe wins; a later like cannot override a pass", () => {
    swipe(likedMe, "pass"); swipe(likedMe, "like");
    expect(getMatches()).toHaveLength(0);
  });
  it("persists across 'reloads' (state is read from disk)", () => {
    swipe(likedMe, "like");
    expect(getFeed().find((p) => p.id === likedMe)).toBeUndefined();
    expect(getMatches()).toHaveLength(1);
  });
  it("seed has 30+ profiles and some who already liked the user", () => {
    expect(profiles.length).toBeGreaterThanOrEqual(30);
    expect(profiles.some((p) => p.likedUser)).toBe(true);
  });
});

