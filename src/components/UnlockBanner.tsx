"use client";

import { PAYMENTS_SOON_MESSAGE } from "@/lib/checkout-errors";

export function UnlockBanner({
  paymentsConfigured,
  canMock,
  onUnlock,
  busy,
  notice,
  ctaLabel,
}: {
  paymentsConfigured: boolean;
  canMock: boolean;
  onUnlock: () => void;
  busy: boolean;
  notice: string | null;
  ctaLabel: string;
}) {
  const paymentsSoon = !paymentsConfigured && !canMock;

  return (
    <div className="rounded-2xl border border-amber-600/40 bg-gradient-to-br from-amber-700/20 to-orange-800/10 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
        Free preview · unlock full card
      </p>
      <h3 className="mt-1 text-xl font-bold text-amber-50">
        Get everything for $1
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
        <li>✓ Markdown download of the full rate card</li>
        <li>✓ Client justification email</li>
        <li>✓ Discount + raise negotiation scripts</li>
        <li>✓ Remove the “Made with RateDeck” mark · 1 regenerate</li>
      </ul>

      <button
        type="button"
        onClick={onUnlock}
        disabled={busy}
        className="mt-5 w-full rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-[#070b14] transition hover:bg-amber-500 disabled:opacity-60"
      >
        {ctaLabel}
      </button>

      {paymentsSoon && !notice ? (
        <p className="mt-3 text-sm text-slate-400">{PAYMENTS_SOON_MESSAGE}</p>
      ) : null}

      {notice ? (
        <p
          className="mt-3 rounded-lg border border-amber-600/20 bg-[#070b14]/50 px-3 py-2 text-sm text-amber-100"
          role="status"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
