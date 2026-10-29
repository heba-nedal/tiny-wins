import i18n from "@/i18n";
import { formatDate } from "@/lib/format-date";

export const LETTER_TITLE_MAX = 120;
export const LETTER_MESSAGE_MAX = 5000;
export const MIN_LEAD_MS = 2 * 60 * 1000;

export type EmailStatus = "not_sent" | "sending" | "sent" | "failed";

export type Letter = {
  id: string;
  user_id: string;
  title: string | null;
  message: string;
  deliver_at: string;
  timezone: string | null;
  email_status: string;
  email_sent_at: string | null;
  created_at: string;
};

export type LetterInput = { title: string; message: string; deliverLocal: string };
export type LetterErrors = Partial<Record<keyof LetterInput, string>>;

/** Parses a datetime-local value ("YYYY-MM-DDTHH:mm") as the browser's local time. */
export function parseLocal(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number) as [number, number, number, number, number, number];
  const date = new Date(y, mo - 1, d, h, mi);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

export function validateLetter(v: LetterInput, now: Date = new Date()): LetterErrors {
  const e: LetterErrors = {};
  if (v.title.trim().length > LETTER_TITLE_MAX) e.title = i18n.t("letters.validation.titleMax", { max: LETTER_TITLE_MAX });
  const msg = v.message.trim();
  if (!msg) e.message = i18n.t("letters.validation.messageRequired");
  else if (msg.length > LETTER_MESSAGE_MAX) e.message = i18n.t("letters.validation.messageMax", { max: LETTER_MESSAGE_MAX });
  const when = parseLocal(v.deliverLocal);
  if (!when) e.deliverLocal = i18n.t("letters.validation.whenRequired");
  else if (when.getTime() - now.getTime() < MIN_LEAD_MS) e.deliverLocal = i18n.t("letters.validation.whenSoon");
  return e;
}

export const isDelivered = (l: Pick<Letter, "deliver_at">, now: number) => new Date(l.deliver_at).getTime() <= now;

export function splitLetters(letters: Letter[], now: number) {
  const upcoming = letters.filter((l) => !isDelivered(l, now)).sort((a, b) => a.deliver_at.localeCompare(b.deliver_at));
  const delivered = letters.filter((l) => isDelivered(l, now)).sort((a, b) => b.deliver_at.localeCompare(a.deliver_at));
  return { upcoming, delivered };
}

export function countdown(target: string, now: number) {
  let s = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const days = Math.floor(s / 86400); s -= days * 86400;
  const hours = Math.floor(s / 3600); s -= hours * 3600;
  const minutes = Math.floor(s / 60);
  return { days, hours, minutes, seconds: s - minutes * 60 };
}

export const userTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || i18n.t("letters.form.localTime");

export const formatDelivery = (iso: string) =>
  formatDate(iso, { dateStyle: "full", timeStyle: "short" });
