import { Link } from "@tanstack/react-router";
import { Mail, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LetterCountdown } from "@/components/letter-countdown";
import { useLetters, useNow } from "@/hooks/use-letters";
import { splitLetters } from "@/lib/letters";

export function LettersCard({ onWrite }: { onWrite: () => void }) {
  const { data, isLoading, error } = useLetters();
  const now = useNow();
  const next = data ? splitLetters(data, now).upcoming[0] : undefined;

  return (
    <section className="rounded-2xl border bg-card/70 p-6" aria-labelledby="letters-card-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-heading" strokeWidth={1.6} />
            <h2 id="letters-card-title" className="text-2xl font-semibold">A Letter to My Future Self</h2>
          </div>
          <p className="text-muted-foreground">Some words are meant to be read later.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/letters">My letters</Link></Button>
          <Button onClick={onWrite}><PenLine /> Write a Letter</Button>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        {isLoading ? "Checking your letters…" : error ? "Couldn't load your letters right now." : next ? (
          <div className="space-y-2">
            <p>Your next letter{next.title ? <> — <span dir="auto" className="text-heading">{next.title}</span></> : null} opens in:</p>
            <LetterCountdown target={next.deliver_at} now={now} />
          </div>
        ) : "No letters waiting yet."}
      </div>
    </section>
  );
}
