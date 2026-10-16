import { Sprout } from "lucide-react";
import { categoryMeta, formatDate, progressStory, type Win } from "@/lib/wins";

export function ProgressStory({ wins }: { wins: Win[] }) {
  const story = progressStory(wins);
  return (
    <section className="border-y py-6" aria-labelledby="progress-story-title">
      <div className="flex items-center gap-2">
        <Sprout className="h-5 w-5 text-heading" strokeWidth={1.6} />
        <h2 id="progress-story-title" className="text-2xl font-semibold">Your Progress Story</h2>
      </div>
      {story.firstDate ? (
        <div className="mt-4 grid gap-5 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-2">
            <p>Since {formatDate(story.firstDate)}, you’ve recorded {story.total} {story.total === 1 ? "win" : "wins"} across {story.categories} {story.categories === 1 ? "category" : "categories"}.</p>
            {story.leadingCategory && <p className="text-sm text-muted-foreground">{categoryMeta(story.leadingCategory).label} is your most celebrated area so far.</p>}
          </div>
          <dl className="grid grid-cols-2 gap-5">
            <div><dt className="text-sm text-muted-foreground">Months with wins</dt><dd className="mt-1 font-display text-2xl text-heading">{story.activeMonths}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Wins this month</dt><dd className="mt-1 font-display text-2xl text-heading">{story.thisMonth}</dd></div>
          </dl>
        </div>
      ) : <p className="mt-3 text-muted-foreground">Your story begins with your first little win.</p>}
    </section>
  );
}