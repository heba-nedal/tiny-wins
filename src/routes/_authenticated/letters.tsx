import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, MailOpen, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LetterFormDialog } from "@/components/letter-form-dialog";
import { LetterCountdown } from "@/components/letter-countdown";
import { useCancelLetter, useLetters, useNow } from "@/hooks/use-letters";
import { formatDate } from "@/lib/format-date";
import { formatDelivery, splitLetters, type Letter } from "@/lib/letters";

export const Route = createFileRoute("/_authenticated/letters")({
  head: () => ({
    meta: [
      { title: i18n.t("meta.letters.title") },
      { name: "description", content: i18n.t("meta.letters.description") },
      { property: "og:title", content: i18n.t("meta.letters.title") },
      { property: "og:description", content: i18n.t("meta.letters.description") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LettersPage,
});

function LettersPage() {
  const { t } = useTranslation();
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState<Letter | null>(null);
  const [cancelling, setCancelling] = useState<Letter | null>(null);
  const { data, isLoading, error, refetch } = useLetters();
  const cancel = useCancelLetter();
  const now = useNow();
  const { upcoming, delivered } = splitLetters(data ?? [], now);

  const confirmCancel = () => {
    if (!cancelling) return;
    cancel.mutate(cancelling.id, {
      onSuccess: () => toast.success(t("letters.cancelled")),
      onError: (e) => toast.error(e.message),
      onSettled: () => setCancelling(null),
    });
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">{t("letters.title")}</h1>
          <p className="text-muted-foreground">{t("letters.subtitle")}</p>
        </div>
        <Button size="lg" onClick={() => setWriting(true)}><PenLine /> {t("letters.write")}</Button>
      </section>

      {isLoading ? <p className="text-muted-foreground">{t("letters.loading")}</p> : error ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t("letters.loadError")}</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>{t("common.tryAgain")}</Button>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">{t("letters.upcoming")}</h2>
            {upcoming.length === 0 ? <Empty text={t("letters.upcomingEmpty")} /> : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((l) => (
                  <article key={l.id} className="space-y-3 rounded-2xl border bg-card/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold"><Lock className="h-4 w-4 text-muted-foreground" /><span dir="auto" className="text-start">{l.title ?? t("letters.untitled")}</span></h3>
                        <p className="text-sm text-muted-foreground">{t("letters.opens", { date: formatDelivery(l.deliver_at) })}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCancelling(l)} aria-label={t("letters.cancelLabel")}><Trash2 /></Button>
                    </div>
                    <LetterCountdown target={l.deliver_at} now={now} />
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">{t("letters.delivered")}</h2>
            {delivered.length === 0 ? <Empty text={t("letters.empty")} /> : (
              <div className="grid gap-4 md:grid-cols-2">
                {delivered.map((l) => (
                  <button key={l.id} onClick={() => setReading(l)} className="space-y-1 rounded-2xl border bg-card/70 p-5 text-start transition-colors hover:border-primary">
                    <h3 className="flex items-center gap-2 text-lg font-semibold"><MailOpen className="h-4 w-4 text-primary" /><span dir="auto" className="text-start">{l.title ?? t("letters.untitled")}</span></h3>
                    <p className="text-sm text-muted-foreground">{t("letters.opened", { date: formatDelivery(l.deliver_at) })}{t(l.email_status === "sent" ? "letters.emailed" : "letters.notEmailed")}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <LetterFormDialog open={writing} onOpenChange={setWriting} />

      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle dir="auto" className="font-display text-2xl text-heading">{reading?.title ?? t("letters.fromPast")}</DialogTitle>
            <DialogDescription>{reading && t("letters.written", { date: formatDate(reading.created_at, { dateStyle: "long" }) })}</DialogDescription>
          </DialogHeader>
          <p dir="auto" className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed">{reading?.message}</p>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("letters.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("letters.cancelBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.keepIt")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={cancel.isPending}>{t("letters.cancelLabel")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed bg-card/60 p-8 text-center text-muted-foreground">{text}</p>;
}
