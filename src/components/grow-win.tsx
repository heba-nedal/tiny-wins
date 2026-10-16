import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWinReflection } from "@/lib/growth-ai.functions";
import type { AiResult, WinReflection } from "@/lib/growth-ai";
import { ReflectionSections } from "./ai-reflection-sections";

export function GrowWin({ id }: { id: string }) {
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
      if (mounted.current) setResult({ status: "error", message: "We couldn't request insights for this win. Check your connection and sign-in, then try again." });
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
        {loading ? "Growing your win…" : reflection ? "Reflect Again" : result?.status === "error" ? "Try Grow This Win Again" : "Grow This Win ✨"}
      </Button>
      <div className="mt-4" aria-live="polite">
        {loading && <p role="status" className="text-sm text-muted-foreground">Reflecting on this achievement and one small next step…</p>}
        {result && result.status !== "success" && <p role={result.status === "error" ? "alert" : "status"} className={result.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{result.message}</p>}
        {reflection && <ReflectionSections sections={[
          { heading: "What This Win Shows", text: reflection.shows },
          { heading: "Build on This Win", text: reflection.buildOn },
          { heading: "Your Next Small Step", text: reflection.nextStep },
          { heading: "Why This Step Fits", text: reflection.why },
        ]} />}
      </div>
    </div>
  );
}