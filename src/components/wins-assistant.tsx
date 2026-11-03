import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WinFormDialog } from "./win-form-dialog";
import { askWins } from "@/lib/assistant.functions";
import { localToday, type AssistantResult } from "@/lib/assistant";
import { aiCodeKey } from "@/lib/growth-ai";
import { categoryLabel, formatDate } from "@/lib/wins";

export function WinsAssistant() {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [adding, setAdding] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  const ask = useServerFn(askWins);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function request() {
    if (locked.current) return;
    if (!question.trim()) { setEmpty(true); setResult(null); return; }
    locked.current = true; setLoading(true); setResult(null); setEmpty(false);
    try {
      const response = await ask({ data: { question: question.trim(), language: i18n.language === "ar" ? "ar" : "en", today: localToday() } });
      if (mounted.current) setResult(response);
    } catch {
      if (mounted.current) setResult({ status: "error", code: "generic" });
    } finally {
      locked.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">{t("assistant.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("assistant.subtitle")}</p>
      </div>
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void request(); }}>
        <div className="flex flex-wrap gap-2">
          {(["month", "learning", "cv"] as const).map((key) => (
            <Button key={key} type="button" variant="outline" disabled={loading} className="h-auto min-h-9 whitespace-normal rounded-full text-start" onClick={() => {
              setQuestion(t(`assistant.suggestions.${key}`)); setEmpty(false); input.current?.focus();
            }}>{t(`assistant.suggestions.${key}`)}</Button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Textarea ref={input} rows={2} maxLength={500} disabled={loading} value={question}
            placeholder={t("assistant.placeholder")} aria-label={t("assistant.placeholder")}
            aria-invalid={empty} aria-describedby={empty ? "assistant-question-error" : undefined}
            onChange={(event) => { setQuestion(event.target.value); setEmpty(false); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void request(); }
            }} />
          <p className="text-end text-xs text-muted-foreground">{t("assistant.counter", { count: question.length, max: 500 })}</p>
          {empty && <p id="assistant-question-error" role="alert" className="text-sm text-destructive">{t("assistant.emptyQuestion")}</p>}
        </div>
        <Button type="submit" disabled={loading}>{loading ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Send />} {t("assistant.send")}</Button>
      </form>
      <div aria-live="polite" aria-busy={loading} className="space-y-4">
        {loading && <p role="status" className="text-sm text-muted-foreground">{t("assistant.thinking")}</p>}
        {result?.status === "error" && <p role="alert" className="text-sm text-destructive">{t(aiCodeKey(result.code))}</p>}
        {result?.status === "empty_wins" && <div className="space-y-3">
          <p className="text-muted-foreground">{t("assistant.emptyWins")}</p>
          <Button onClick={() => setAdding(true)}><Plus /> {t("common.addWin")}</Button>
        </div>}
        {result?.status === "ok" && !result.found && <p className="text-muted-foreground">{t("assistant.notFound")}</p>}
        {result?.status === "ok" && result.found && <>
          <div className="rounded-lg border bg-card p-5 shadow-soft">
            <p dir="auto" className="whitespace-pre-wrap break-words text-start">{result.answer}</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t("assistant.sourcesTitle")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.sources.map((source) => <div key={source.id} className="rounded-lg border bg-card p-4">
                <h3 dir="auto" className="break-words font-semibold">{source.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(source.achievement_date)} · {categoryLabel(source.category)}</p>
              </div>)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("assistant.disclaimer")}</p>
        </>}
      </div>
      <WinFormDialog open={adding} onOpenChange={setAdding} />
    </div>
  );
}