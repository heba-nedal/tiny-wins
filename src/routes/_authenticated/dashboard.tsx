import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthStaircase } from "@/components/growth-staircase";
import { WinCard } from "@/components/win-card";
import { WinFormDialog } from "@/components/win-form-dialog";
import { WinsState } from "@/components/wins-state";
import { GrowthStory } from "@/components/growth-story";
import { WinGarden } from "@/components/win-garden";
import { useWins } from "@/hooks/use-wins";
import { countThisMonth } from "@/lib/wins";
import { LettersCard } from "@/components/letters-card";
import { LetterFormDialog } from "@/components/letter-form-dialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Tiny Wins" },
      { name: "description", content: "Your recent small wins and progress at a glance." },
      { property: "og:title", content: "Dashboard · Tiny Wins" },
      { property: "og:description", content: "Your recent small wins and progress at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [adding, setAdding] = useState(false);
  const [writing, setWriting] = useState(false);
  const { data, isLoading, error, refetch } = useWins();
  const wins = data ?? [];

  return (
    <div className="space-y-8">
      <section className="grid items-center gap-8 py-2 md:grid-cols-2 md:py-6">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Small steps.<br />Real progress.</h1>
          <p className="text-lg text-muted-foreground">Every little achievement deserves a place.</p>
          <Button size="lg" onClick={() => setAdding(true)}><Plus /> Add a Win</Button>
          <dl className="flex gap-8 pt-4">
            <div><dt className="text-sm text-muted-foreground">Total wins</dt><dd className="font-display text-3xl text-heading">{isLoading || error ? "–" : wins.length}</dd></div>
            <div><dt className="text-sm text-muted-foreground">This month</dt><dd className="font-display text-3xl text-heading">{isLoading || error ? "–" : countThisMonth(wins)}</dd></div>
          </dl>
        </div>
        <GrowthStaircase className="mx-auto" />
      </section>

      <GrowthStory wins={wins} isLoading={isLoading} error={error} onRetry={() => refetch()} onAdd={() => setAdding(true)} />
      <WinGarden wins={wins} onAdd={() => setAdding(true)} />
      <LettersCard onWrite={() => setWriting(true)} />
      <LetterFormDialog open={writing} onOpenChange={setWriting} />

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Recent Wins</h2>
          {wins.length > 0 && <Link to="/gallery" className="flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>}
        </div>
        <WinsState isLoading={isLoading} error={error} empty={wins.length === 0} onAdd={() => setAdding(true)}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wins.slice(0, 6).map((w) => <WinCard key={w.id} win={w} />)}
          </div>
        </WinsState>
      </section>
      <WinFormDialog open={adding} onOpenChange={setAdding} />
    </div>
  );
}
