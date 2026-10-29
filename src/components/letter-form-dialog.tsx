import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateLetter } from "@/hooks/use-letters";
import { LETTER_MESSAGE_MAX, LETTER_TITLE_MAX, formatDelivery, parseLocal, userTimezone, validateLetter, type LetterErrors, type LetterInput } from "@/lib/letters";

const empty: LetterInput = { title: "", message: "", deliverLocal: "" };
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function LetterFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation();
  const [v, setV] = useState<LetterInput>(empty);
  const [errors, setErrors] = useState<LetterErrors>({});
  const [tz, setTz] = useState("");
  const [minLocal, setMinLocal] = useState("");
  const create = useCreateLetter();

  useEffect(() => {
    if (open) {
      setV(empty); setErrors({}); setTz(userTimezone());
      setMinLocal(toLocalInput(new Date(Date.now() + 5 * 60 * 1000)));
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLetter(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const when = parseLocal(v.deliverLocal)!;
    create.mutate(
      { title: v.title.trim() || null, message: v.message.trim(), deliver_at: when.toISOString(), timezone: tz },
      {
        onSuccess: (row) => { toast.success(t("letters.form.sealed", { date: formatDelivery(row.deliver_at) })); onOpenChange(false); },
        onError: (err) => toast.error(err.message.includes("future") ? t("letters.form.futureError") : t("letters.form.saveError", { message: err.message })),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-heading">{t("letters.form.title")}</DialogTitle>
          <DialogDescription>{t("letters.form.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="letter-title">{t("letters.form.titleLabel")} <span className="text-muted-foreground">{t("common.optional")}</span></Label>
            <Input id="letter-title" dir="auto" maxLength={LETTER_TITLE_MAX} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} aria-invalid={!!errors.title} />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="letter-message">{t("letters.form.messageLabel")}</Label>
            <Textarea id="letter-message" dir="auto" rows={7} maxLength={LETTER_MESSAGE_MAX} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={!!errors.message} placeholder={t("letters.form.messagePlaceholder")} />
            <p className="text-end text-xs text-muted-foreground">{v.message.length}/{LETTER_MESSAGE_MAX}</p>
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="letter-when">{t("letters.form.whenLabel")}</Label>
            <Input id="letter-when" type="datetime-local" min={minLocal} value={v.deliverLocal} onChange={(e) => setV({ ...v, deliverLocal: e.target.value })} aria-invalid={!!errors.deliverLocal} />
            <p className="text-xs text-muted-foreground">{t("letters.form.timezone")} <span className="text-heading">{tz}</span></p>
            {errors.deliverLocal && <p className="text-sm text-destructive">{errors.deliverLocal}</p>}
          </div>
          <p className="rounded-lg bg-sage/50 p-3 text-sm text-muted-foreground">
            {t("letters.form.notice")}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? t("letters.form.sealing") : t("letters.form.seal")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
