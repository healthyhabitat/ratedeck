import type {
  EngagementType,
  RateBreakdown,
  RateCard,
  RateInput,
  RateRanges,
  Seniority,
} from "./types";

/** Deterministic FNV-1a style hash for stable seeds / scarcity tags */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SENIORITY_BASE: Record<Seniority, number> = {
  junior: 45,
  mid: 75,
  senior: 110,
  lead: 145,
  principal: 185,
};

const SENIORITY_LABEL: Record<Seniority, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  principal: "Principal / Staff",
};

/** High-demand skill tokens → scarcity bump */
const SCARCE_SKILLS: { re: RegExp; label: string; bump: number }[] = [
  { re: /\b(ai|ml|llm|gpt|machine learning|genai|rag)\b/i, label: "AI / ML", bump: 0.18 },
  { re: /\b(rust|golang|go\b|kotlin|scala)\b/i, label: "systems languages", bump: 0.12 },
  { re: /\b(kubernetes|k8s|devops|sre|platform eng)\b/i, label: "platform / DevOps", bump: 0.14 },
  { re: /\b(security|infosec|appsec|pentest)\b/i, label: "security", bump: 0.16 },
  { re: /\b(data eng|spark|dbt|snowflake|bigquery)\b/i, label: "data engineering", bump: 0.12 },
  { re: /\b(ios|android|react native|flutter|mobile)\b/i, label: "mobile", bump: 0.1 },
  { re: /\b(blockchain|web3|solidity)\b/i, label: "web3", bump: 0.08 },
  { re: /\b(figma|product design|ux research|design system)\b/i, label: "product design", bump: 0.1 },
  { re: /\b(shopify|salesforce|hubspot|sap)\b/i, label: "enterprise platforms", bump: 0.09 },
  { re: /\b(typescript|react|next\.?js|node)\b/i, label: "modern web stack", bump: 0.06 },
];

const MARKET_RULES: { re: RegExp; label: string; mult: number }[] = [
  { re: /\b(sf|san francisco|bay area|silicon valley|nyc|new york|seattle)\b/i, label: "Tier-1 US tech hub", mult: 1.35 },
  { re: /\b(london|zurich|geneva|singapore|sydney|toronto)\b/i, label: "global premium city", mult: 1.25 },
  { re: /\b(la|los angeles|austin|boston|denver|chicago|vancouver|berlin|amsterdam|dublin)\b/i, label: "strong metro", mult: 1.15 },
  { re: /\b(remote\s*(us|usa|united states)|us remote|usa remote)\b/i, label: "US remote", mult: 1.2 },
  { re: /\b(remote\s*(eu|europe)|eu remote|europe remote)\b/i, label: "EU remote", mult: 1.05 },
  // Emerging / offshore before generic "remote" so "Remote India" matches correctly
  { re: /\b(india|pakistan|bangladesh|nigeria|philippines|vietnam|eastern europe|latam|latin america)\b/i, label: "emerging / offshore market", mult: 0.65 },
  { re: /\b(midwest|south|ohio|texas|florida|atlanta|phoenix|raleigh)\b/i, label: "US regional", mult: 0.95 },
  { re: /\b(remote|worldwide|global)\b/i, label: "global remote", mult: 1.0 },
];

function roundTo(n: number, step = 5): number {
  return Math.round(n / step) * step;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;/|]+|\band\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 12);
}

export function detectMarket(marketRaw: string): { label: string; mult: number } {
  const m = marketRaw.trim() || "Remote";
  for (const rule of MARKET_RULES) {
    if (rule.re.test(m)) return { label: rule.label, mult: rule.mult };
  }
  // Default: treat unknown city as mid-tier remote-adjacent
  if (/\bremote\b/i.test(m)) return { label: "global remote", mult: 1.0 };
  return { label: `${m} (estimated metro)`, mult: 1.05 };
}

export function detectScarcity(skillsRaw: string): {
  mult: number;
  notes: string[];
} {
  const hits: { label: string; bump: number }[] = [];
  for (const s of SCARCE_SKILLS) {
    if (s.re.test(skillsRaw)) {
      hits.push({ label: s.label, bump: s.bump });
    }
  }
  // Cap stacked bumps so we stay premium but not absurd
  const raw = hits.reduce((acc, h) => acc + h.bump, 0);
  const mult = 1 + clamp(raw, 0, 0.4);
  const notes =
    hits.length === 0
      ? ["Generalist skill mix — scarcity near baseline (1.00×)."]
      : hits.map(
          (h) =>
            `${h.label}: +${Math.round(h.bump * 100)}% scarcity premium`
        );
  return { mult: Math.round(mult * 100) / 100, notes };
}

/** Years of experience nudge relative to seniority band (±15% max) */
export function yearsAdjustment(years: number, seniority: Seniority): number {
  const expected: Record<Seniority, number> = {
    junior: 1.5,
    mid: 4,
    senior: 8,
    lead: 11,
    principal: 14,
  };
  const delta = years - expected[seniority];
  // ±2.5% per year of delta, capped ±15%
  return clamp(1 + delta * 0.025, 0.85, 1.15);
}

export function computeHourly(input: RateInput): {
  hourly: number;
  breakdown: RateBreakdown;
  scarcityNotes: string[];
  marketLabel: string;
} {
  const base = SENIORITY_BASE[input.seniority];
  const market = detectMarket(input.market);
  const scarcity = detectScarcity(input.skills);
  const yearsAdj = Math.round(yearsAdjustment(input.years, input.seniority) * 100) / 100;
  const raw = base * market.mult * scarcity.mult * yearsAdj;
  const hourly = roundTo(raw, 5);

  const formulaSteps = [
    `Base (${SENIORITY_LABEL[input.seniority]}): $${base}/hr`,
    `× Market (${market.label}): ${market.mult.toFixed(2)}×`,
    `× Scarcity (skills): ${scarcity.mult.toFixed(2)}×`,
    `× Years vs band (${input.years}y): ${yearsAdj.toFixed(2)}×`,
    `= $${raw.toFixed(1)} → rounded $${hourly}/hr`,
  ];

  return {
    hourly,
    marketLabel: market.label,
    scarcityNotes: scarcity.notes,
    breakdown: {
      baseHourly: base,
      marketMultiplier: market.mult,
      scarcityMultiplier: scarcity.mult,
      yearsAdjustment: yearsAdj,
      formula: `$${base} × ${market.mult.toFixed(2)} × ${scarcity.mult.toFixed(2)} × ${yearsAdj.toFixed(2)} ≈ $${hourly}/hr`,
      formulaSteps,
    },
  };
}

function buildRanges(hourly: number, engagement: EngagementType): RateRanges {
  // Spread: low = 0.85× mid, high = 1.2× mid (premium room)
  const mid = hourly;
  const low = roundTo(mid * 0.85, 5);
  const high = roundTo(mid * 1.2, 5);

  // Project: assume ~80–160 billable hours depending on engagement framing
  const projectHours =
    engagement === "project" ? 100 : engagement === "retainer" ? 80 : 120;
  const projectMid = roundTo(mid * projectHours, 100);
  const projectLow = roundTo(projectMid * 0.8, 100);
  const projectHigh = roundTo(projectMid * 1.35, 100);

  // Retainer: ~40–60 hrs/month effective
  const retainerLow = roundTo(mid * 40, 50);
  const retainerHigh = roundTo(mid * 60, 50);

  return {
    hourlyLow: low,
    hourlyMid: mid,
    hourlyHigh: high,
    projectLow,
    projectMid,
    projectHigh,
    retainerMonthlyLow: retainerLow,
    retainerMonthlyHigh: retainerHigh,
  };
}

function titleCaseSkill(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      if (["ai", "ml", "ui", "ux", "api", "seo", "ios", "aws", "gcp"].includes(lower))
        return lower.toUpperCase();
      if (lower === "typescript") return "TypeScript";
      if (lower === "javascript") return "JavaScript";
      if (lower === "next.js" || lower === "nextjs") return "Next.js";
      if (lower === "nodejs" || lower === "node") return "Node.js";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function buildPositioning(
  skills: string[],
  seniority: Seniority,
  marketLabel: string,
  years: number,
  ranges: RateRanges
): string {
  const skillPhrase =
    skills.length === 0
      ? "specialist freelance work"
      : skills.length === 1
        ? titleCaseSkill(skills[0])
        : skills.length === 2
          ? `${titleCaseSkill(skills[0])} and ${titleCaseSkill(skills[1])}`
          : `${skills
              .slice(0, 3)
              .map(titleCaseSkill)
              .join(", ")}`;
  return `${SENIORITY_LABEL[seniority]} freelancer (${years} years) specializing in ${skillPhrase}. Anchored for ${marketLabel} at $${ranges.hourlyLow}–$${ranges.hourlyHigh}/hr — priced to signal senior craft without racing to the bottom.`;
}

function buildJustificationEmail(
  input: RateInput,
  ranges: RateRanges,
  breakdown: RateBreakdown,
  skills: string[],
  marketLabel: string
): string {
  const skillLine = skills.map(titleCaseSkill).join(", ") || "your stated stack";
  return `Subject: Rate card for our engagement

Hi {{ClientName}},

Thanks for the conversation about the work ahead. Here's a clear rate card so we can move fast without ambiguity.

**Recommended rates**
• Hourly: $${ranges.hourlyLow}–$${ranges.hourlyHigh}/hr (anchor $${ranges.hourlyMid})
• Typical project: $${ranges.projectLow.toLocaleString()}–$${ranges.projectHigh.toLocaleString()}
• Monthly retainer: $${ranges.retainerMonthlyLow.toLocaleString()}–$${ranges.retainerMonthlyHigh.toLocaleString()}

**Why this range**
I'm pricing as a ${SENIORITY_LABEL[input.seniority].toLowerCase()} specialist in ${skillLine} for a ${marketLabel} market (${input.years} years experience). The formula is transparent: base $${breakdown.baseHourly}/hr × market ${breakdown.marketMultiplier.toFixed(2)}× × skill scarcity ${breakdown.scarcityMultiplier.toFixed(2)}× × years adjustment ${breakdown.yearsAdjustment.toFixed(2)}×.

What you get at this rate: focused delivery, senior judgment on tradeoffs, and fewer revision loops — not commodity hours.

Happy to scope a fixed project or retainer if that fits better than pure hourly. Looking forward to aligning on the first milestone.

Best,
{{YourName}}`;
}

function buildDiscountScript(ranges: RateRanges): string {
  return `If they push on price:

"I can meet you at $${ranges.hourlyLow}/hr if we lock a clear scope and a ${Math.max(20, Math.round(ranges.hourlyMid))}–hour minimum this month — that keeps quality high and calendar predictable for both of us. Below that, I'd rather recommend a smaller slice of the work than dilute the outcome."

Never apologize for the rate. Trade scope, timeline, or payment terms — not craft.`;
}

function buildRaiseScript(ranges: RateRanges, seniority: Seniority): string {
  const next = roundTo(ranges.hourlyMid * 1.15, 5);
  return `When raising rates (after a win or at renewal):

"Given the results on [project] and demand for ${SENIORITY_LABEL[seniority].toLowerCase()} work in this stack, my rate moves to $${next}/hr starting [date]. Existing scoped work stays at the agreed number; new work uses the updated card."

Give 2–4 weeks notice on retainers. Attach one concrete outcome you delivered so the raise feels earned, not arbitrary.`;
}

function buildComparisonNotes(
  ranges: RateRanges,
  marketLabel: string,
  scarcityNotes: string[]
): string[] {
  return [
    `Agencies billing the same stack in ${marketLabel} often land at $${roundTo(ranges.hourlyMid * 1.4, 5)}–$${roundTo(ranges.hourlyMid * 2.2, 5)}/hr fully loaded — your indie rate should undercut agency overhead, not peer freelancers racing to $25/hr.`,
    `Staffing platforms compress mid toward $${roundTo(ranges.hourlyMid * 0.7, 5)}/hr after fees. Quote direct; mention platform rates only if the client brings them up.`,
    scarcityNotes[0] ?? "Scarcity at baseline — differentiate on outcomes and speed.",
    `Project quote heuristic: hourly mid × estimated hours × 1.15 contingency. For a ~100h build that's ~$${ranges.projectMid.toLocaleString()} at your mid rate.`,
  ];
}

function buildTitle(skills: string[], seniority: Seniority): string {
  const top = skills.slice(0, 2).map(titleCaseSkill).join(" · ") || "Freelance";
  return `${SENIORITY_LABEL[seniority]} Rate Card — ${top}`;
}

/**
 * Deterministic rate card — same inputs → same outputs.
 * Formula is always exposed in the UI (no black-box pricing).
 */
export function generateRateCard(input: RateInput): RateCard {
  const skillsRaw = input.skills.trim();
  if (!skillsRaw || skillsRaw.length < 2) {
    throw new Error("Skills must be at least 2 characters.");
  }
  const years = clamp(Number(input.years) || 0, 0, 40);
  const normalized: RateInput = {
    skills: skillsRaw,
    years,
    market: (input.market || "Remote").trim(),
    engagement: input.engagement,
    seniority: input.seniority,
  };

  const skills = parseSkills(skillsRaw);
  const { hourly, breakdown, scarcityNotes, marketLabel } =
    computeHourly(normalized);
  const ranges = buildRanges(hourly, normalized.engagement);
  const seed = hashSeed(
    `${skillsRaw}|${years}|${normalized.market}|${normalized.engagement}|${normalized.seniority}`
  );

  return {
    title: buildTitle(skills, normalized.seniority),
    positioning: buildPositioning(
      skills,
      normalized.seniority,
      marketLabel,
      years,
      ranges
    ),
    ranges,
    breakdown,
    justificationEmail: buildJustificationEmail(
      normalized,
      ranges,
      breakdown,
      skills,
      marketLabel
    ),
    discountScript: buildDiscountScript(ranges),
    raiseScript: buildRaiseScript(ranges, normalized.seniority),
    comparisonNotes: buildComparisonNotes(ranges, marketLabel, scarcityNotes),
    scarcityNotes,
    marketLabel,
    skillsList: skills,
    engagement: normalized.engagement,
    seniority: normalized.seniority,
    years,
    generatedAt: new Date().toISOString(),
    seed: seed.toString(16),
  };
}

/** Markdown export of a full rate card */
export function cardToMarkdown(card: RateCard): string {
  const r = card.ranges;
  return `# ${card.title}

> ${card.positioning}

## Rate ranges
| | Low | Mid (anchor) | High |
|--|--:|--:|--:|
| Hourly | $${r.hourlyLow} | $${r.hourlyMid} | $${r.hourlyHigh} |
| Project | $${r.projectLow.toLocaleString()} | $${r.projectMid.toLocaleString()} | $${r.projectHigh.toLocaleString()} |
| Retainer / mo | $${r.retainerMonthlyLow.toLocaleString()} | — | $${r.retainerMonthlyHigh.toLocaleString()} |

## Transparent formula
${card.breakdown.formulaSteps.map((s) => `- ${s}`).join("\n")}

**Compact:** \`${card.breakdown.formula}\`

## Scarcity notes
${card.scarcityNotes.map((n) => `- ${n}`).join("\n")}

## Positioning
${card.positioning}

## Justification email
${card.justificationEmail}

## Discount script
${card.discountScript}

## Raise script
${card.raiseScript}

## Comparison notes
${card.comparisonNotes.map((n) => `- ${n}`).join("\n")}

---
Generated with RateDeck · ${card.generatedAt}
`;
}

export { SENIORITY_BASE, SENIORITY_LABEL };
