import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWinReflection } from "@/lib/growth-ai.functions";
import type { AiResult, WinReflection } from "@/lib/growth-ai";
import { ReflectionSections } from "./ai-reflection-sections";

export function GrowWin({ id }: { id: string }) {
  const { t } = useTranslation();
  const [result, setResult] = useState<AiResult<WinReflection> | null>(null);
  const [loading, setLoading] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const generate = useServerFn(getWinReflection);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function request() {
    if (locked.current) return;
    locked.current = true; setLoading(true); setResult(null);
    try {
      const response = await generate({ data: { id } });
      if (mounted.current) setResult(response);
    } catch {
      if (mounted.current) setResult({ status: "error", message: t("wins.grow.requestError") });
    } finally {
      locked.current = false;
      if (mounted.current) setLoading(false);
    }
  }
  const reflection = result?.status === "success" ? result.reflection : null;
  return (
    <div className="border-t pt-4" aria-busy={loading}>
      <Button variant="secondary" className="h-auto min-h-9 whitespace-normal" onClick={request} disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Sparkles />}
        {loading ? t("wins.grow.loading") : reflection ? t("wins.grow.again") : result?.status === "error" ? t("wins.grow.retry") : t("wins.grow.button")}
      </Button>
      <div className="mt-4" aria-live="polite">
        {loading && <p role="status" className="text-sm text-muted-foreground">{t("wins.grow.loadingStatus")}</p>}
        {result && result.status !== "success" && <p role={result.status === "error" ? "alert" : "status"} className={result.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{result.message}</p>}
        {reflection && <ReflectionSections sections={[
          { heading: t("wins.grow.shows"), text: reflection.shows },
          { heading: t("wins.grow.buildOn"), text: reflection.buildOn },
          { heading: t("wins.grow.nextStep"), text: reflection.nextStep },
          { heading: t("wins.grow.why"), text: reflection.why },
        ]} />}
      </div>
    </div>
  );
}