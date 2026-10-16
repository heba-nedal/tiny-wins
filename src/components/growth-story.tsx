import { Plus, RefreshCw, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryMeta, formatDate, groupWinsByMonth, type Win } from "@/lib/wins";
import { MonthlyReflectionCard } from "./monthly-reflection";

export function GrowthStory({ wins, isLoading, error, onRetry, onAdd }: {
  wins: Win[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onAdd: () => void;
}) {
  const groups = groupWinsByMonth(wins);
  return (
    <section className="border-y py-6" aria-labelledby="growth-story-title">
      <div className="flex items-center gap-2">
        <Sprout className="h-5 w-5 text-heading" strokeWidth={1.6} />
        <h2 id="growth-story-title" className="text-2xl font-semibold">My Growth Story</h2>
      </div>
      <p className="mt-1 text-muted-foreground">Every small win is part of a bigger story.</p>
      <MonthlyReflectionCard />
      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3" aria-hidden>
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-card p-6">
            <p className="text-destructive">We couldn't load your story right now.</p>
            <Button variant="outline" onClick={onRetry}><RefreshCw /> Try again</Button>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-heading"><Sprout strokeWidth={1.6} /></span>
            <h3 className="text-xl font-semibold">Your story starts with your first little win.</h3>
            <Button onClick={onAdd}><Plus /> Record your first win</Button>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-border" aria-hidden />
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.key} aria-label={group.label}>
                  <h3 className="font-display text-xl text-heading">{group.label}</h3>
                  <ol className="mt-3 space-y-3">
                    {group.wins.map((win) => {
                      const m = categoryMeta(win.category);
                      return (
                        <li key={win.id} className="relative pl-8">
                          <span className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" aria-hidden />
                          <div className="rounded-2xl border bg-card p-4 shadow-soft">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                              <h4 dir="auto" className="font-semibold leading-snug">{win.title}</h4>
                              <span className="text-xs text-muted-foreground">{formatDate(win.achievement_date)}</span>
                            </div>
                            {win.description && <p dir="auto" className="mt-1 line-clamp-2 text-sm text-muted-foreground">{win.description}</p>}
                            <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium text-heading ${m.tone}`}>{m.label}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
