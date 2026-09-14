"use client";

import { CopyButton } from "./CopyButton";

export function ResultBlock({
  id,
  title,
  children,
  copyText,
  locked,
  lockHint,
  lockAction,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  copyText?: string;
  locked?: boolean;
  lockHint?: string;
  lockAction?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-white/8 bg-[#0c1222]/70 p-5 sm:p-6"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-500/90">
          {title}
        </h3>
        {copyText && !locked ? <CopyButton text={copyText} /> : null}
      </div>
      {locked ? (
        <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-6 text-center">
          <p className="text-sm text-slate-300">
            {lockHint ?? "Unlock the full pack for $1 to reveal this section."}
          </p>
          {lockAction ? <div className="mt-4 flex justify-center">{lockAction}</div> : null}
        </div>
      ) : (
        <div className="text-[15px] leading-relaxed text-slate-200">{children}</div>
      )}
    </section>
  );
}
