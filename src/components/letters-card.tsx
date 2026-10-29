import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Mail, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LetterCountdown } from "@/components/letter-countdown";
import { useLetters, useNow } from "@/hooks/use-letters";
import { splitLetters } from "@/lib/letters";

export function LettersCard({ onWrite }: { onWrite: () => void }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useLetters();
  const now = useNow();
  const next = data ? splitLetters(data, now).upcoming[0] : undefined;

  return (
    <section className="rounded-2xl border bg-card/70 p-6" aria-labelledby="letters-card-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-heading" strokeWidth={1.6} />
            <h2 id="letters-card-title" className="text-2xl font-semibold">{t("dashboard.lettersCard.title")}</h2>
          </div>
          <p className="text-muted-foreground">{t("dashboard.lettersCard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/letters">{t("dashboard.lettersCard.myLetters")}</Link></Button>
          <Button onClick={onWrite}><PenLine /> {t("letters.write")}</Button>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        {isLoading ? t("dashboard.lettersCard.loading") : error ? t("dashboard.lettersCard.error") : next ? (
          <div className="space-y-2">
            <p>{next.title ? <Trans i18nKey="dashboard.lettersCard.nextTitled" values={{ title: next.title }} components={{ 1: <span dir="auto" className="text-heading" /> }} /> : t("dashboard.lettersCard.next")}</p>
            <LetterCountdown target={next.deliver_at} now={now} />
          </div>
        ) : t("dashboard.lettersCard.none")}
      </div>
    </section>
  );
}
