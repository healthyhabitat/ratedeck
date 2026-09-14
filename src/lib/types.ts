export type EngagementType = "hourly" | "project" | "retainer";
export type Seniority = "junior" | "mid" | "senior" | "lead" | "principal";

export interface RateInput {
  skills: string;
  years: number;
  market: string;
  engagement: EngagementType;
  seniority: Seniority;
}

export interface RateBreakdown {
  baseHourly: number;
  marketMultiplier: number;
  scarcityMultiplier: number;
  yearsAdjustment: number;
  formula: string;
  formulaSteps: string[];
}

export interface RateRanges {
  hourlyLow: number;
  hourlyMid: number;
  hourlyHigh: number;
  projectLow: number;
  projectMid: number;
  projectHigh: number;
  retainerMonthlyLow: number;
  retainerMonthlyHigh: number;
}

export interface RateCard {
  title: string;
  positioning: string;
  ranges: RateRanges;
  breakdown: RateBreakdown;
  justificationEmail: string;
  discountScript: string;
  raiseScript: string;
  comparisonNotes: string[];
  scarcityNotes: string[];
  marketLabel: string;
  skillsList: string[];
  engagement: EngagementType;
  seniority: Seniority;
  years: number;
  generatedAt: string;
  seed: string;
}

export interface GenerateResult {
  card: RateCard;
  unlocked: boolean;
}
