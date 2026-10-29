import { useTranslation } from "react-i18next";
import { countdown } from "@/lib/letters";

export function LetterCountdown({ target, now, compact = false }: { target: string; now: number; compact?: boolean }) {
  const { t } = useTranslation();
  const c = countdown(target, now);
  const parts: [number, string, string][] = [[c.days, "days", t("letters.countdown.days")], [c.hours, "hours", t("letters.countdown.hours")], [c.minutes, "min", t("letters.countdown.min")], [c.seconds, "sec", t("letters.countdown.sec")]];
  if (compact) return <span className="tabular-nums">{t("letters.countdown.compact", { d: c.days, h: c.hours, m: c.minutes, s: c.seconds })}</span>;
  return (
    <dl className="flex gap-3" aria-label={t("letters.countdown.label")}>
      {parts.map(([n, l, label]) => (
        <div key={l} className="min-w-12 rounded-lg border bg-background/70 px-2 py-1 text-center">
          <dd className="font-display text-xl tabular-nums text-heading">{n}</dd>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
