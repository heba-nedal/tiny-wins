import { categoryMeta, formatDate, progressStory, type Win } from "@/lib/wins";

export function ProgressSummary({ wins }: { wins: Win[] }) {
  const story = progressStory(wins);
  if (!story.firstDate) return null;
  return (
    <div className="mt-6 grid items-start gap-4 md:mt-8 md:grid-cols-[1.5fr_1fr] md:gap-5">
      <div className="space-y-2 leading-relaxed">
        <p>Since {formatDate(story.firstDate)}, you’ve recorded {story.total} {story.total === 1 ? "win" : "wins"} across {story.categories} {story.categories === 1 ? "category" : "categories"}.</p>
        {story.leadingCategory && <p className="text-sm text-muted-foreground">{categoryMeta(story.leadingCategory).label} is your most celebrated area so far.</p>}
      </div>
      <dl className="grid grid-cols-2 gap-5">
        <div><dt className="text-sm text-muted-foreground">Months with wins</dt><dd className="mt-1 font-display text-2xl text-heading">{story.activeMonths}</dd></div>
      </dl>
    </div>
  );
}
