import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WinCard } from "@/components/win-card";
import { WinFormDialog } from "@/components/win-form-dialog";
import { WinsState } from "@/components/wins-state";
import { useWins } from "@/hooks/use-wins";
import { CATEGORIES, categoryLabel, type Category } from "@/lib/wins";

export const Route = createFileRoute("/_authenticated/gallery")({
  head: () => ({
    meta: [
      { title: i18n.t("meta.gallery.title") },
      { name: "description", content: i18n.t("meta.gallery.description") },
      { property: "og:title", content: i18n.t("meta.gallery.title") },
      { property: "og:description", content: i18n.t("meta.gallery.description") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<Category | "all">("all");
  const { data, isLoading, error } = useWins();
  const all = data ?? [];
  const wins = filter === "all" ? all : all.filter((w) => w.category === filter);
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50"}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">{t("gallery.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("gallery.subtitle")}</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus /> {t("common.addWin")}</Button>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("gallery.filterLabel")}>
        <Button variant="ghost" className={chip(filter === "all")} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t("gallery.all")}</Button>
        {CATEGORIES.map((c) => (
          <Button variant="ghost" key={c.value} className={chip(filter === c.value)} aria-pressed={filter === c.value} onClick={() => setFilter(c.value)}><c.icon strokeWidth={1.6} />{categoryLabel(c.value)}</Button>
        ))}
      </div>
      {!isLoading && !error && all.length > 0 && wins.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">{t("gallery.emptyCategory")}</p>
      ) : (
        <WinsState isLoading={isLoading} error={error} empty={all.length === 0} onAdd={() => setAdding(true)}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wins.map((w) => <WinCard key={w.id} win={w} />)}
          </div>
        </WinsState>
      )}
      <WinFormDialog open={adding} onOpenChange={setAdding} />
    </div>
  );
}
