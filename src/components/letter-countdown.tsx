import { countdown } from "@/lib/letters";

export function LetterCountdown({ target, now, compact = false }: { target: string; now: number; compact?: boolean }) {
  const c = countdown(target, now);
  const parts: [number, string][] = [[c.days, "days"], [c.hours, "hours"], [c.minutes, "min"], [c.seconds, "sec"]];
  if (compact) return <span className="tabular-nums">{c.days}d {c.hours}h {c.minutes}m {c.seconds}s</span>;
  return (
    <dl className="flex gap-3" aria-label="Time until this letter opens">
      {parts.map(([n, l]) => (
        <div key={l} className="min-w-12 rounded-lg border bg-background/70 px-2 py-1 text-center">
          <dd className="font-display text-xl tabular-nums text-heading">{n}</dd>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{l}</dt>
        </div>
      ))}
    </dl>
  );
}
