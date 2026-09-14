import { describe, it, expect } from "vitest";
import {
  generateRateCard,
  cardToMarkdown,
  hashSeed,
  computeHourly,
  detectMarket,
  detectScarcity,
  parseSkills,
  yearsAdjustment,
  SENIORITY_BASE,
} from "./rates";
import type { RateInput } from "./types";

const base: RateInput = {
  skills: "TypeScript, React, Next.js",
  years: 6,
  market: "Remote US",
  engagement: "hourly",
  seniority: "senior",
};

describe("hashSeed", () => {
  it("is deterministic", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });
});

describe("parseSkills", () => {
  it("splits on commas and and", () => {
    expect(parseSkills("React, TypeScript and Node")).toEqual([
      "React",
      "TypeScript",
      "Node",
    ]);
  });
});

describe("detectMarket", () => {
  it("boosts SF / NYC", () => {
    expect(detectMarket("San Francisco").mult).toBeGreaterThan(1.2);
    expect(detectMarket("NYC").mult).toBeGreaterThan(1.2);
  });

  it("handles remote US", () => {
    const m = detectMarket("Remote US");
    expect(m.mult).toBe(1.2);
    expect(m.label).toMatch(/US remote/i);
  });

  it("handles emerging markets", () => {
    expect(detectMarket("Remote India").mult).toBeLessThan(0.8);
  });
});

describe("detectScarcity", () => {
  it("raises for AI / security skills", () => {
    const ai = detectScarcity("Python, LLM, RAG");
    const plain = detectScarcity("HTML, CSS");
    expect(ai.mult).toBeGreaterThan(plain.mult);
  });

  it("caps stacked bumps", () => {
    const stacked = detectScarcity(
      "AI ML LLM Rust Kubernetes Security Data Eng Snowflake iOS Solidity"
    );
    expect(stacked.mult).toBeLessThanOrEqual(1.4);
  });
});

describe("yearsAdjustment", () => {
  it("nudges within band", () => {
    expect(yearsAdjustment(12, "senior")).toBeGreaterThan(1);
    expect(yearsAdjustment(2, "senior")).toBeLessThan(1);
    expect(yearsAdjustment(40, "junior")).toBeLessThanOrEqual(1.15);
  });
});

describe("computeHourly", () => {
  it("matches transparent formula pieces", () => {
    const { hourly, breakdown } = computeHourly(base);
    expect(breakdown.baseHourly).toBe(SENIORITY_BASE.senior);
    expect(hourly).toBeGreaterThan(0);
    expect(breakdown.formula).toContain("$");
    expect(breakdown.formulaSteps.length).toBe(5);
  });
});

describe("generateRateCard", () => {
  it("returns a complete deterministic card", () => {
    const a = generateRateCard(base);
    const b = generateRateCard(base);
    expect(a.ranges.hourlyMid).toBe(b.ranges.hourlyMid);
    expect(a.seed).toBe(b.seed);
    expect(a.positioning.length).toBeGreaterThan(40);
    expect(a.justificationEmail).toMatch(/Subject:/);
    expect(a.discountScript.length).toBeGreaterThan(40);
    expect(a.raiseScript.length).toBeGreaterThan(40);
    expect(a.comparisonNotes.length).toBeGreaterThanOrEqual(3);
    expect(a.breakdown.formulaSteps.length).toBe(5);
    expect(a.ranges.hourlyLow).toBeLessThanOrEqual(a.ranges.hourlyMid);
    expect(a.ranges.hourlyHigh).toBeGreaterThanOrEqual(a.ranges.hourlyMid);
  });

  it("rejects empty skills", () => {
    expect(() =>
      generateRateCard({ ...base, skills: " " })
    ).toThrow(/Skills/);
  });

  it("principal + scarce skills > junior generalist", () => {
    const junior = generateRateCard({
      skills: "WordPress",
      years: 1,
      market: "Remote",
      engagement: "hourly",
      seniority: "junior",
    });
    const principal = generateRateCard({
      skills: "AI, Kubernetes, Security",
      years: 15,
      market: "San Francisco",
      engagement: "hourly",
      seniority: "principal",
    });
    expect(principal.ranges.hourlyMid).toBeGreaterThan(
      junior.ranges.hourlyMid * 2
    );
  });

  it("exports markdown with formula", () => {
    const md = cardToMarkdown(generateRateCard(base));
    expect(md).toMatch(/Transparent formula/);
    expect(md).toMatch(/RateDeck/);
    expect(md).toMatch(/Justification email/);
  });
});
