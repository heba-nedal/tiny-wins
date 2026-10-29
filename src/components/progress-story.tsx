import { useTranslation } from "react-i18next";
import { categoryMeta, formatDate, progressStory, type Win } from "@/lib/wins";

export function ProgressSummary({ wins }: { wins: Win[] }) {
  const { t } = useTranslation();
  const story = progressStory(wins);
  if (!story.firstDate) return null;
  return (
    <div className="mt-6 grid items-start gap-4 md:mt-8 md:grid-cols-[1.5fr_1fr] md:gap-5">
      <div className="space-y-2 leading-relaxed">
        <p>{t("dashboard.growth.summary", { date: formatDate(story.firstDate), wins: t("dashboard.growth.wins", { count: story.total }), categories: t("dashboard.growth.categories", { count: story.categories }) })}</p>
        {story.leadingCategory && <p className="text-sm text-muted-foreground">{t("dashboard.growth.leading", { category: categoryMeta(story.leadingCategory).label })}</p>}
      </div>
      <dl className="grid grid-cols-2 gap-5">
        <div><dt className="text-sm text-muted-foreground">{t("dashboard.growth.activeMonths")}</dt><dd className="mt-1 font-display text-2xl text-heading">{story.activeMonths}</dd></div>
      </dl>
    </div>
  );
}
