import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarHeart, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMonthlyReflection } from "@/lib/growth-ai.functions";
import { currentMonth, monthBounds, type AiResult, type MonthlyReflection } from "@/lib/growth-ai";
import { formatDate } from "@/lib/format-date";
import { ReflectionSections } from "./ai-reflection-sections";

export function MonthlyReflectionCard() {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState("");
  const [result, setResult] = useState<AiResult<MonthlyReflection> | null>(null);
  const [loading, setLoading] = useState(false);
  const locked = useRef(false);
  const selected = useRef("");
  const mounted = useRef(true);
  const generate = useServerFn(getMonthlyReflection);
  useEffect(() => {
    mounted.current = true;
    const initial = currentMonth();
    setMonth(initial); selected.current = initial;
    return () => { mounted.current = false; };
  }, []);

  async function request() {
    if (locked.current) return;
    try { monthBounds(month); } catch { setResult({ status: "error", message: t("dashboard.month.invalid") }); return; }
    const requested = month;
    locked.current = true; setLoading(true); setResult(null);
    try {
      const response = await generate({ data: { month: requested, lang: i18n.language === "ar" ? "ar" : "en" } });
      if (mounted.current && selected.current === requested) setResult(response);
    } catch {
      if (mounted.current && selected.current === requested) setResult({ status: "error", message: t("dashboard.month.requestError") });
    } finally {
      locked.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  const reflection = result?.status === "success" ? result.reflection : null;
  return (
    <div className="mt-8 rounded-2xl border bg-card p-5 shadow-soft sm:p-6 md:mt-10" aria-labelledby="monthly-reflection-title">
      <div className="flex items-center gap-2">
        <CalendarHeart className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <h3 id="monthly-reflection-title" className="text-xl font-semibold">{t("dashboard.month.title")}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.month.subtitle")}</p>
      <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-44">
          <label htmlFor="reflection-month" className="mb-1.5 block text-sm font-medium">{t("dashboard.month.label")}</label>
          <Input id="reflection-month" type="month" value={month} min="0001-01" max="9998-12" disabled={loading} onChange={(event) => { selected.current = event.target.value; setMonth(event.target.value); setResult(null); }} />
        </div>
        <Button className="h-auto min-h-9 w-full whitespace-normal text-center sm:w-auto" disabled={loading || !month} onClick={request}>
          {loading ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Sparkles />}
          {loading ? t("dashboard.month.loading") : reflection ? t("dashboard.month.again") : t("dashboard.month.generate")}
        </Button>
      </div>
      <div className="mt-5" aria-busy={loading} aria-live="polite">
        {loading && <p role="status" className="text-sm text-muted-foreground">{t("dashboard.month.loadingStatus")}</p>}
        {result && result.status !== "success" && <p role={result.status === "error" ? "alert" : "status"} className={result.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{result.message}</p>}
        {reflection && <div className="border-t pt-5">
          <p className="mb-4 text-xs text-muted-foreground">{t("dashboard.month.header", { month: formatDate(`${reflection.month}-01T00:00:00`, { month: "long", year: "numeric" }), wins: t("dashboard.growth.wins", { count: reflection.count }) })}</p>
          <ReflectionSections sections={[
            { heading: t("dashboard.month.review"), text: reflection.review },
            { heading: t("dashboard.month.patterns"), text: reflection.patterns },
            { heading: t("dashboard.month.celebrate"), title: reflection.celebratedTitle, text: reflection.celebration },
            { heading: t("dashboard.month.nextStep"), text: reflection.nextStep },
          ]} />
        </div>}
      </div>
    </div>
  );
}