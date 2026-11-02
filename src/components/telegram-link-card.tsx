import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createTelegramLink, readTelegramLink, unlinkTelegram, TELEGRAM_BOT_USERNAME,
  telegramCountdown, telegramSecondsRemaining, type TelegramLinkToken,
} from "@/lib/telegram";

export function TelegramLinkCard() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [linked, setLinked] = useState(false);
  const [link, setLink] = useState<TelegramLinkToken | null>(null);
  const [now, setNow] = useState(Date.now);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const remaining = link ? telegramSecondsRemaining(link.expires_at, now) : 0;
  const waiting = Boolean(link && remaining > 0 && !linked);

  useEffect(() => {
    let active = true;
    readTelegramLink().then((data) => {
      if (active) setLinked(Boolean(data));
    }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!waiting) return;
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    let active = true;
    let checking = false;
    const poll = window.setInterval(async () => {
      if (checking || !link || telegramSecondsRemaining(link.expires_at, Date.now()) === 0) return;
      checking = true;
      try {
        const data = await readTelegramLink();
        if (active && data) {
          setLinked(true);
          setLink(null);
          setError(false);
          toast.success(t("telegram.linked"));
        }
      } catch { if (active) setError(true); }
      finally { checking = false; }
    }, 3000);
    return () => { active = false; window.clearInterval(clock); window.clearInterval(poll); };
  }, [waiting, link, t]);

  async function createLink() {
    setBusy(true);
    setError(false);
    try {
      const created = await createTelegramLink(i18n.resolvedLanguage ?? i18n.language);
      setNow(Date.now());
      setLink(created);
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  async function unlink() {
    setBusy(true);
    setError(false);
    try {
      await unlinkTelegram();
      setLinked(false);
      setLink(null);
      setConfirm(false);
      toast.success(t("telegram.unlinked"));
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border bg-card/70 p-6" aria-labelledby="telegram-card-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 shrink-0 text-heading" strokeWidth={1.6} />
            <h2 id="telegram-card-title" className="text-2xl font-semibold">{t("telegram.title")}</h2>
          </div>
          <p className="text-muted-foreground">{t(linked ? "telegram.linkedBody" : "telegram.subtitle")}</p>
          {!linked && <p className="pt-2 text-sm text-muted-foreground">{t("telegram.privacyNote")}</p>}
        </div>
        {!loading && (linked ? (
          <Button variant="outline" disabled={busy} onClick={() => setConfirm(true)}>{t("telegram.unlink")}</Button>
        ) : waiting && link ? (
          <Button asChild><a href={`https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(link.token)}`} target="_blank" rel="noopener noreferrer"><Send />{t("telegram.openTelegram")}</a></Button>
        ) : (
          <Button disabled={busy} onClick={createLink}><Send />{t(busy ? "telegram.creating" : link ? "telegram.newLink" : "telegram.connect")}</Button>
        ))}
      </div>
      <div className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {loading ? <Skeleton className="h-4 w-40" /> : linked ? <p>{t("telegram.linked")}</p> : waiting ? (
          <div className="space-y-2"><p>{t("telegram.waiting")}</p><p>{t("telegram.expiresIn", { time: telegramCountdown(remaining) })}</p></div>
        ) : link ? <p>{t("telegram.expired")}</p> : null}
        {error && <p role="alert" className="mt-2 text-destructive">{t("telegram.error")}</p>}
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("telegram.unlinkTitle")}</AlertDialogTitle><AlertDialogDescription>{t("telegram.unlinkBody")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); void unlink(); }}>{t("telegram.unlink")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}