import { NextResponse } from "next/server";
import { generateRateCard } from "@/lib/rates";
import { isUnlocked } from "@/lib/unlock";
import type { EngagementType, RateInput, Seniority } from "@/lib/types";

const ENGAGEMENTS: EngagementType[] = ["hourly", "project", "retainer"];
const SENIORITIES: Seniority[] = [
  "junior",
  "mid",
  "senior",
  "lead",
  "principal",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RateInput>;
    const skills = (body.skills ?? "").trim();
    if (skills.length < 2) {
      return NextResponse.json(
        { error: "Skills must be at least 2 characters." },
        { status: 400 }
      );
    }

    const engagement = (body.engagement ?? "hourly") as EngagementType;
    const seniority = (body.seniority ?? "senior") as Seniority;
    if (!ENGAGEMENTS.includes(engagement)) {
      return NextResponse.json(
        { error: "Invalid engagement type." },
        { status: 400 }
      );
    }
    if (!SENIORITIES.includes(seniority)) {
      return NextResponse.json(
        { error: "Invalid seniority." },
        { status: 400 }
      );
    }

    const years = Math.min(40, Math.max(0, Number(body.years) || 0));

    const card = generateRateCard({
      skills,
      years,
      market: body.market?.trim() || "Remote",
      engagement,
      seniority,
    });

    const unlocked = await isUnlocked();

    const publicCard = unlocked
      ? card
      : {
          ...card,
          justificationEmail: "",
          discountScript: "",
          raiseScript: "",
        };

    return NextResponse.json({ card: publicCard, unlocked });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
