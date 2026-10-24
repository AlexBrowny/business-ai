import { describe, expect, it } from "vitest";
import { leadSchema } from "./leads";
import { isRateLimited } from "./rateLimit";

const valid = { name: "Анна", contact: "+79991234567", consent: true };

describe("leadSchema", () => {
  it("accepts a minimal valid lead and applies defaults", () => {
    const r = leadSchema.parse(valid);
    expect(r.source).toBe("form");
    expect(r.answers).toEqual({});
  });

  it("rejects missing consent", () => {
    expect(leadSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(leadSchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });

  it("rejects too-short contact and unknown source", () => {
    expect(leadSchema.safeParse({ ...valid, contact: "123" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, source: "hack" }).success).toBe(false);
  });
});

describe("isRateLimited", () => {
  it("blocks after the limit and recovers after the window", () => {
    const key = `t-${Math.random()}`;
    expect(isRateLimited(key, 2, 1000, 0)).toBe(false);
    expect(isRateLimited(key, 2, 1000, 10)).toBe(false);
    expect(isRateLimited(key, 2, 1000, 20)).toBe(true);
    expect(isRateLimited(key, 2, 1000, 2000)).toBe(false);
  });
});
