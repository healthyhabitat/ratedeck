import Link from "next/link";

const benefits = [
  {
    title: "Hourly + project ranges",
    body: "Low / anchor / high rates plus project and retainer bands — ready to send.",
  },
  {
    title: "Transparent formula",
    body: "Base by seniority × market multiplier × skill scarcity × years — no black box.",
  },
  {
    title: "Client justification email",
    body: "A polished note that explains the rate without sounding defensive.",
  },
  {
    title: "Discount & raise scripts",
    body: "What to say when they push — and how to raise later without burning the relationship.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span aria-hidden>◆</span> Freelance rate cards
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-amber-50 sm:text-5xl sm:leading-[1.1]">
            Know what to charge.
            <span className="block bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              Ship a rate card in minutes.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            RateDeck turns your skills, experience, market, and engagement type
            into a premium freelance rate card — hourly ranges, positioning,
            client email, and negotiation scripts.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-8 py-3.5 text-base font-semibold text-[#070b14] shadow-[0_0_40px_-8px_rgba(217,119,6,0.55)] transition hover:bg-amber-500 sm:w-auto"
            >
              Build my rate card — free →
            </Link>
            <p className="text-sm text-slate-400">
              Free preview · Full unlock{" "}
              <span className="font-semibold text-amber-400">$1</span>
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#0c1222]/50 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-amber-50">
            Everything you need before the next sales call
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-slate-400">
            Not a random number generator — a transparent heuristic you can
            defend.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-white/8 bg-[#070b14]/60 p-5"
              >
                <h3 className="font-semibold text-amber-300">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-amber-50">
            Three steps to a defensible rate
          </h2>
          <ol className="mt-8 space-y-4">
            {[
              "Enter skills, years, market, engagement, and seniority vibe.",
              "See hourly + project ranges with the formula spelled out.",
              "Unlock email + scripts for $1 — send with confidence.",
            ].map((step, i) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-white/8 bg-[#0c1222]/60 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-[#070b14]">
                  {i + 1}
                </span>
                <p className="pt-1 text-slate-200">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-700/15 to-transparent p-8 text-center">
          <h2 className="text-2xl font-bold text-amber-50">
            Free preview. $1 for the full card.
          </h2>
          <p className="mt-3 text-slate-300 leading-relaxed">
            Preview ranges and the formula free. Unlock Markdown, client email,
            discount/raise scripts, and one regenerate — for a single dollar.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex rounded-xl bg-amber-600 px-8 py-3.5 text-base font-semibold text-[#070b14] hover:bg-amber-500"
          >
            Start free →
          </Link>
        </div>
      </section>
    </main>
  );
}
