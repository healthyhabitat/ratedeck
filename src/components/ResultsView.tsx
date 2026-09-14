"use client";

import { ResultBlock } from "./ResultBlock";
import { UnlockBanner } from "./UnlockBanner";
import { useCheckout } from "@/hooks/useCheckout";
import { cardToMarkdown } from "@/lib/rates";
import type { RateCard } from "@/lib/types";

const NAV = [
  { href: "#rates", label: "Rates" },
  { href: "#formula", label: "Formula" },
  { href: "#positioning", label: "Positioning" },
  { href: "#scripts", label: "Scripts" },
] as const;

export function ResultsView({
  card,
  unlocked,
  paymentsConfigured,
  canMock,
  onRegenerate,
  canRegenerate,
  regenerating,
}: {
  card: RateCard;
  unlocked: boolean;
  paymentsConfigured: boolean;
  canMock: boolean;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
  regenerating?: boolean;
}) {
  const { busy, notice, unlock, ctaLabel } = useCheckout({
    paymentsConfigured,
    canMock,
  });

  function downloadMd() {
    const md = cardToMarkdown(card);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.title.replace(/[^\w]+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const unlockBtn = (
    <button
      type="button"
      onClick={unlock}
      disabled={busy}
      className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-[#070b14] transition hover:bg-amber-500 disabled:opacity-60"
    >
      {busy ? "Starting…" : "Unlock full card — $1"}
    </button>
  );

  const r = card.ranges;

  return (
    <div className="relative space-y-4 pb-24 print:space-y-3 print:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">
            Your rate card
          </p>
          <h2 className="text-2xl font-bold text-amber-50 sm:text-3xl">
            {card.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unlocked ? (
            <button
              type="button"
              onClick={downloadMd}
              className="rounded-lg border border-amber-600/30 bg-amber-600/10 px-3 py-1.5 text-sm font-medium text-amber-100 hover:bg-amber-600/20"
            >
              Download Markdown
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled
                title="Unlock for $1 to download"
                className="cursor-not-allowed rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-500"
              >
                Download Markdown 🔒
              </button>
              {unlockBtn}
            </>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:border-white/20"
          >
            Print
          </button>
          {unlocked && canRegenerate && onRegenerate ? (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:border-white/20 disabled:opacity-50"
            >
              {regenerating ? "Regenerating…" : "Regenerate (1×)"}
            </button>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="Results sections"
        className="sticky top-0 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-white/8 bg-[#070b14]/90 p-1.5 backdrop-blur-md print:hidden"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-amber-200"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {!unlocked ? (
        <div className="print:hidden">
          <UnlockBanner
            paymentsConfigured={paymentsConfigured}
            canMock={canMock}
            onUnlock={unlock}
            busy={busy}
            notice={notice}
            ctaLabel={ctaLabel}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 print:hidden">
          Full card unlocked. Copy, download, and send to clients.
        </p>
      )}

      <div id="rates" className="scroll-mt-24 space-y-4">
        <ResultBlock
          title="Hourly range"
          copyText={`$${r.hourlyLow}–$${r.hourlyHigh}/hr (anchor $${r.hourlyMid})`}
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase text-slate-500">Low</p>
              <p className="mt-1 text-2xl font-bold text-amber-100">
                ${r.hourlyLow}
              </p>
            </div>
            <div className="rounded-xl border border-amber-600/40 bg-amber-600/10 p-3">
              <p className="text-xs uppercase text-amber-400">Anchor</p>
              <p className="mt-1 text-2xl font-bold text-amber-50">
                ${r.hourlyMid}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase text-slate-500">High</p>
              <p className="mt-1 text-2xl font-bold text-amber-100">
                ${r.hourlyHigh}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Project: ${r.projectLow.toLocaleString()}–$
            {r.projectHigh.toLocaleString()} · Retainer: $
            {r.retainerMonthlyLow.toLocaleString()}–$
            {r.retainerMonthlyHigh.toLocaleString()}/mo
          </p>
        </ResultBlock>
      </div>

      <div id="formula" className="scroll-mt-24">
        <ResultBlock
          title="Transparent formula"
          copyText={card.breakdown.formulaSteps.join("\n")}
        >
          <ol className="list-decimal space-y-1.5 pl-5 font-mono text-sm text-amber-100/90">
            {card.breakdown.formulaSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-slate-300">
            {card.breakdown.formula}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-400">
            {card.scarcityNotes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </ResultBlock>
      </div>

      <div id="positioning" className="scroll-mt-24 space-y-4">
        <ResultBlock title="Positioning statement" copyText={card.positioning}>
          <p className="text-lg text-slate-100">{card.positioning}</p>
        </ResultBlock>

        <ResultBlock
          title="Comparison notes"
          copyText={card.comparisonNotes.map((n) => `• ${n}`).join("\n")}
        >
          <ul className="list-disc space-y-2 pl-5">
            {card.comparisonNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </ResultBlock>
      </div>

      <div id="scripts" className="scroll-mt-24 space-y-4">
        <ResultBlock
          title="Justification email to client"
          copyText={unlocked ? card.justificationEmail : undefined}
          locked={!unlocked}
          lockHint="Unlock for $1 to reveal the client-ready justification email."
          lockAction={!unlocked ? unlockBtn : undefined}
        >
          <pre className="whitespace-pre-wrap font-sans text-[15px]">
            {card.justificationEmail}
          </pre>
        </ResultBlock>

        <ResultBlock
          title="Discount script"
          copyText={unlocked ? card.discountScript : undefined}
          locked={!unlocked}
          lockHint="Unlock for $1 to reveal discount negotiation language."
          lockAction={!unlocked ? unlockBtn : undefined}
        >
          <pre className="whitespace-pre-wrap font-sans text-[15px]">
            {card.discountScript}
          </pre>
        </ResultBlock>

        <ResultBlock
          title="Raise script"
          copyText={unlocked ? card.raiseScript : undefined}
          locked={!unlocked}
          lockHint="Unlock for $1 to reveal the rate-raise script."
          lockAction={!unlocked ? unlockBtn : undefined}
        >
          <pre className="whitespace-pre-wrap font-sans text-[15px]">
            {card.raiseScript}
          </pre>
        </ResultBlock>
      </div>

      {!unlocked ? (
        <p className="text-center text-xs text-slate-500 print:block">
          Made with RateDeck
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#070b14]/95 px-4 py-3 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2">
          <p className="truncate text-sm text-slate-400">
            {unlocked ? "Full card unlocked" : "Preview · unlock email + scripts"}
          </p>
          <div className="flex flex-wrap gap-2">
            {unlocked ? (
              <button
                type="button"
                onClick={downloadMd}
                className="rounded-lg border border-amber-600/30 bg-amber-600/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-600/20"
              >
                Download Markdown
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-500"
                >
                  Download 🔒
                </button>
                <button
                  type="button"
                  onClick={unlock}
                  disabled={busy}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-[#070b14] hover:bg-amber-500 disabled:opacity-60"
                >
                  {busy ? "Starting…" : "Unlock full card — $1"}
                </button>
              </>
            )}
          </div>
        </div>
        {notice && !unlocked ? (
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-amber-200/90">
            {notice}
          </p>
        ) : null}
      </div>
    </div>
  );
}
