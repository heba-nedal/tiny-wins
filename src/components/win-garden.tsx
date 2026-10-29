import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Flower2, Images, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import winGardenIllustration from "@/assets/win-garden.png";
import { gardenStats } from "@/lib/garden";
import type { Win } from "@/lib/wins";

export function WinGarden({ wins, onAdd }: { wins: Win[]; onAdd: () => void }) {
  const { t } = useTranslation();
  const stats = gardenStats(wins);

  return (
    <section className="border-b py-6 pt-0" aria-labelledby="win-garden-title">
      <div className="flex items-center gap-2">
        <Flower2 className="h-5 w-5 text-heading" strokeWidth={1.6} />
        <h2 id="win-garden-title" className="text-2xl font-semibold">{t("dashboard.garden.title")}</h2>
      </div>
      <p className="mt-1 text-muted-foreground">{t("dashboard.garden.subtitle")}</p>

      {wins.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-heading"><Flower2 strokeWidth={1.6} /></span>
          <h3 className="text-xl font-semibold">{t("dashboard.garden.emptyTitle")}</h3>
          <p className="max-w-sm text-muted-foreground">{t("dashboard.garden.emptyBody")}</p>
          <Button onClick={onAdd}><Plus /> {t("common.recordFirstWin")}</Button>
        </div>
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-3 gap-4">
            <div><dt className="text-sm text-muted-foreground">{t("dashboard.garden.flowers")}</dt><dd className="mt-1 font-display text-2xl text-heading">{stats.flowers}</dd></div>
          </dl>

          <img
            src={winGardenIllustration}
            alt={t("illustration.gardenAlt")}
            width={1994}
            height={789}
            className="mt-4 h-auto w-full"
          />

          <div className="flex justify-end pt-3">
            <Button variant="outline" asChild>
              <Link to="/gallery"><Images className="h-4 w-4" /> {t("dashboard.garden.seeAll")}</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
