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
import { formatDelivery, splitLetters, type Letter } from "@/lib/letters";

export const Route = createFileRoute("/_authenticated/letters")({
  head: () => ({
    meta: [
      { title: "Letters to Myself · Tiny Wins" },
      { name: "description", content: "Write sealed letters to your future self and open them when the day arrives." },
      { property: "og:title", content: "Letters to Myself · Tiny Wins" },
      { property: "og:description", content: "Write sealed letters to your future self and open them when the day arrives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LettersPage,
});

function LettersPage() {
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
      onSuccess: () => toast.success("Letter cancelled."),
      onError: (e) => toast.error(e.message),
      onSettled: () => setCancelling(null),
    });
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">Letters to Myself</h1>
          <p className="text-muted-foreground">Write to who you're becoming. Letters open here when their time comes.</p>
        </div>
        <Button size="lg" onClick={() => setWriting(true)}><PenLine /> Write a Letter</Button>
      </section>

      {isLoading ? <p className="text-muted-foreground">Loading your letters…</p> : error ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Couldn't load your letters.</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Upcoming Letters</h2>
            {upcoming.length === 0 ? <Empty text="No sealed letters yet. Write one for a day worth remembering." /> : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((l) => (
                  <article key={l.id} className="space-y-3 rounded-2xl border bg-card/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 dir="auto" className="flex items-center gap-2 text-lg font-semibold"><Lock className="h-4 w-4 text-muted-foreground" />{l.title ?? "Untitled letter"}</h3>
                        <p className="text-sm text-muted-foreground">Opens {formatDelivery(l.deliver_at)}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCancelling(l)} aria-label="Cancel letter"><Trash2 /></Button>
                    </div>
                    <LetterCountdown target={l.deliver_at} now={now} />
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Delivered Letters</h2>
            {delivered.length === 0 ? <Empty text="Delivered letters will appear here to read." /> : (
              <div className="grid gap-4 md:grid-cols-2">
                {delivered.map((l) => (
                  <button key={l.id} onClick={() => setReading(l)} className="space-y-1 rounded-2xl border bg-card/70 p-5 text-left transition-colors hover:border-primary">
                    <h3 dir="auto" className="flex items-center gap-2 text-lg font-semibold"><MailOpen className="h-4 w-4 text-primary" />{l.title ?? "Untitled letter"}</h3>
                    <p className="text-sm text-muted-foreground">Opened {formatDelivery(l.deliver_at)} · available in Tiny Wins{l.email_status === "sent" ? " · emailed" : " · not emailed"}</p>
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
            <DialogTitle dir="auto" className="font-display text-2xl text-heading">{reading?.title ?? "A letter from your past self"}</DialogTitle>
            <DialogDescription>Written {reading && new Date(reading.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}</DialogDescription>
          </DialogHeader>
          <p dir="auto" className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed">{reading?.message}</p>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this letter?</AlertDialogTitle>
            <AlertDialogDescription>It will be deleted permanently and won't open on its date.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={cancel.isPending}>Cancel letter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed bg-card/60 p-8 text-center text-muted-foreground">{text}</p>;
}
