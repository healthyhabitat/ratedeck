"use client";

import { useState } from "react";
import type { EngagementType, Seniority } from "@/lib/types";

export interface FormValues {
  skills: string;
  years: number;
  market: string;
  engagement: EngagementType;
  seniority: Seniority;
}

export function RateForm({
  onSubmit,
  loading,
  initial,
}: {
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
  initial?: Partial<FormValues>;
}) {
  const [skills, setSkills] = useState(initial?.skills ?? "");
  const [years, setYears] = useState(initial?.years ?? 5);
  const [market, setMarket] = useState(initial?.market ?? "Remote US");
  const [engagement, setEngagement] = useState<EngagementType>(
    initial?.engagement ?? "hourly"
  );
  const [seniority, setSeniority] = useState<Seniority>(
    initial?.seniority ?? "senior"
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (skills.trim().length < 2) {
      setError("List at least one skill (e.g. TypeScript, UX research).");
      return;
    }
    setError(null);
    onSubmit({
      skills: skills.trim(),
      years: Number(years) || 0,
      market: market.trim() || "Remote",
      engagement,
      seniority,
    });
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-[#070b14] px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-600/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="skills"
          className="mb-1.5 block text-sm font-medium text-slate-200"
        >
          Skills <span className="text-amber-500">*</span>
        </label>
        <textarea
          id="skills"
          name="skills"
          required
          rows={3}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. TypeScript, React, Next.js, product design"
          className={`${field} resize-y`}
          disabled={loading}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-rose-400" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">
            Comma-separated. Scarce skills (AI, security, platform…) raise the
            multiplier.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="years"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            Years of experience
          </label>
          <input
            id="years"
            name="years"
            type="number"
            min={0}
            max={40}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={field}
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="market"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            Market (city / remote)
          </label>
          <input
            id="market"
            name="market"
            type="text"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="e.g. NYC, Remote US, London, Remote India"
            className={field}
            disabled={loading}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-200">
          Engagement type
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["hourly", "Hourly"],
              ["project", "Project"],
              ["retainer", "Retainer"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                engagement === value
                  ? "border-amber-600/60 bg-amber-600/15 text-amber-100"
                  : "border-white/10 bg-[#070b14] text-slate-400 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="engagement"
                value={value}
                checked={engagement === value}
                onChange={() => setEngagement(value)}
                className="sr-only"
                disabled={loading}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-200">
          Seniority vibe
        </legend>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {(
            [
              ["junior", "Jr"],
              ["mid", "Mid"],
              ["senior", "Sr"],
              ["lead", "Lead"],
              ["principal", "Prin"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border px-1 py-2.5 text-center text-xs font-medium transition sm:text-sm ${
                seniority === value
                  ? "border-amber-600/60 bg-amber-600/15 text-amber-100"
                  : "border-white/10 bg-[#070b14] text-slate-400 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="seniority"
                value={value}
                checked={seniority === value}
                onChange={() => setSeniority(value)}
                className="sr-only"
                disabled={loading}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 text-base font-semibold text-[#070b14] transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#070b14]/30 border-t-[#070b14]" />
            Building your rate card…
          </>
        ) : (
          "Generate my rate card →"
        )}
      </button>
    </form>
  );
}
