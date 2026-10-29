import { currentLanguage } from "@/i18n";

/** Locale-aware date formatting that always uses Western digits. */
export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  const locale = currentLanguage() === "ar" ? "ar-PS" : "en-US";
  return new Intl.DateTimeFormat(locale, { ...options, numberingSystem: "latn" }).format(new Date(date));
}
