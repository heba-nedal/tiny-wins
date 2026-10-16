import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestNextWin } from "@/lib/next-win.functions";
import type { Suggestion } from "@/lib/next-win";
import { categoryMeta } from "@/lib/wins";

export function NextWinCard({ onAdd }: { onAdd: (s: Suggestion) => void }) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const askServer = useServerFn(suggestNextWin);
  const ask = useMutation({
    mutationFn: () => askServer(),
    onSuccess: (s) => setSuggestion(s),
  });

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-soft" aria-labelledby="next-win-title">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-heading" strokeWidth={1.6} />
        <h2 id="next-win-title" className="text-2xl font-semibold">Your Next Little Win</h2>
      </div>
      {ask.isPending ? (
        <p className="mt-4 flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> Thinking of something small for you…
        </p>
      ) : suggestion ? (
        <div className="mt-4 space-y-3">
          <div>
            <p className="font-display text-xl text-heading">{suggestion.title}</p>
            {suggestion.description && <p className="mt-1 text-muted-foreground">{suggestion.description}</p>}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-heading">Why this one:</span> {suggestion.reason}
          </p>
          <p className="text-sm text-muted-foreground">Category: {categoryMeta(suggestion.category).label}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={() => onAdd(suggestion)}><Sprout /> Add this win</Button>
            <Button variant="outline" onClick={() => ask.mutate()} disabled={ask.isPending}><Sparkles /> Suggest another</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {ask.isError ? (
            <p className="text-sm text-destructive">We couldn't get a suggestion: {ask.error.message}</p>
          ) : (
            <p className="text-muted-foreground">Based on your recent wins, we'll suggest one small thing you could do today.</p>
          )}
          <Button onClick={() => ask.mutate()} disabled={ask.isPending}><Sparkles /> {ask.isError ? "Try again" : "Suggest my next win"}</Button>
        </div>
      )}
    </section>
  );
}
