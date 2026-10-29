import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function WinsState({ isLoading, error, empty, onAdd, emptyText, children }: {
  isLoading: boolean; error: Error | null; empty: boolean; onAdd: () => void; emptyText?: string; children: ReactNode;
}) {
  const { t } = useTranslation();
  if (isLoading)
    return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>;
  if (error)
    return <p className="rounded-2xl border border-destructive/30 bg-card p-6 text-destructive">{t("wins.loadError", { message: error.message })}</p>;
  if (empty)
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/60 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-heading"><Sprout strokeWidth={1.6} /></span>
        <h3 className="text-xl font-semibold">{emptyText ?? t("wins.emptyTitle")}</h3>
        <p className="max-w-sm text-muted-foreground">{t("wins.emptyBody")}</p>
        <Button onClick={onAdd}><Plus /> {t("common.recordFirstWin")}</Button>
      </div>
    );
  return <>{children}</>;
}
