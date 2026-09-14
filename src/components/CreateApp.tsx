"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RateForm, type FormValues } from "./RateForm";
import { ResultsView } from "./ResultsView";
import type { RateCard } from "@/lib/types";

const STORAGE_KEY = "rd_last_card";
const FORM_KEY = "rd_last_form";
const REGEN_KEY = "rd_regen_used";

export function CreateApp({
  initialUnlocked = false,
}: {
  initialUnlocked?: boolean;
}) {
  const [card, setCard] = useState<RateCard | null>(null);
  const [lastForm, setLastForm] = useState<FormValues | null>(null);
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [paymentsConfigured, setPaymentsConfigured] = useState(false);
  const [canMock, setCanMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenUsed, setRegenUsed] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const refreshed = useRef(false);

  const persistCard = (c: RateCard) => {
    setCard(c);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
  };

  const generate = useCallback(async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setLastForm(values);
    try {
      sessionStorage.setItem(FORM_KEY, JSON.stringify(values));
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as {
        card?: RateCard;
        unlocked?: boolean;
        error?: string;
      };
      if (!res.ok || !data.card) {
        setError(data.error ?? "Generation failed.");
        setLoading(false);
        return;
      }
      persistCard(data.card);
      if (typeof data.unlocked === "boolean") setUnlocked(data.unlocked);
    } catch {
      setError("Network error — check your connection and try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/unlock/status")
      .then((r) => r.json())
      .then(
        (d: {
          unlocked?: boolean;
          paymentsConfigured?: boolean;
          canMock?: boolean;
        }) => {
          if (d.unlocked) setUnlocked(true);
          setPaymentsConfigured(Boolean(d.paymentsConfigured));
          setCanMock(Boolean(d.canMock));
        }
      )
      .catch(() => {});

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setCard(JSON.parse(raw) as RateCard);
      const formRaw = sessionStorage.getItem(FORM_KEY);
      if (formRaw) setLastForm(JSON.parse(formRaw) as FormValues);
      setRegenUsed(sessionStorage.getItem(REGEN_KEY) === "1");
    } catch {
      /* ignore */
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "1")
      setBanner("Checkout canceled — no charge.");
    if (params.get("unlock_error") === "1")
      setBanner("Could not verify payment. Try again or contact support.");
    if (params.get("unlocked") === "1")
      setBanner("Welcome back — full rate card unlocked.");
  }, []);

  useEffect(() => {
    if (!unlocked || refreshed.current) return;
    let form = lastForm;
    if (!form) {
      try {
        const formRaw = sessionStorage.getItem(FORM_KEY);
        if (formRaw) form = JSON.parse(formRaw) as FormValues;
      } catch {
        /* ignore */
      }
    }
    if (!form) return;
    refreshed.current = true;
    void generate(form);
  }, [unlocked, lastForm, generate]);

  async function regenerate() {
    if (!lastForm || regenUsed) return;
    sessionStorage.setItem(REGEN_KEY, "1");
    setRegenUsed(true);
    // Tiny market salt to nudge seed while keeping same intent
    await generate({
      ...lastForm,
      market: lastForm.market
        ? `${lastForm.market.trim()} `
        : `Remote ${Date.now() % 97}`,
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
          RateDeck · Create
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-amber-50 sm:text-4xl">
          Skills in. Rate card out.
        </h1>
        <p className="mt-2 text-slate-400">
          Free preview with hourly ranges + formula. Unlock Markdown, client
          email, and negotiation scripts for $1.
        </p>
      </header>

      {banner ? (
        <p
          className="mb-6 rounded-xl border border-amber-600/20 bg-amber-600/10 px-4 py-2.5 text-sm text-amber-100"
          role="status"
        >
          {banner}
        </p>
      ) : null}

      <div className="rounded-2xl border border-white/8 bg-[#0c1222]/80 p-5 sm:p-6">
        <RateForm
          onSubmit={generate}
          loading={loading}
          initial={lastForm ?? undefined}
        />
      </div>

      {error ? (
        <p
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading && !card ? (
        <div
          className="mt-8 animate-pulse space-y-3"
          aria-busy="true"
          aria-label="Loading"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : null}

      {!loading && !card && !error ? (
        <p className="mt-8 text-center text-sm text-slate-500">
          Your rate card will show here — ranges, formula, positioning, and
          scripts.
        </p>
      ) : null}

      {card ? (
        <div className="mt-10">
          <ResultsView
            card={card}
            unlocked={unlocked}
            paymentsConfigured={paymentsConfigured}
            canMock={canMock}
            onRegenerate={regenerate}
            canRegenerate={!regenUsed}
            regenerating={loading}
          />
        </div>
      ) : null}
    </div>
  );
}
