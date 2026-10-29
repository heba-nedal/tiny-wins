import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { code: "en", name: "English", short: "EN" },
  { code: "ar", name: "العربية", short: "ع" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = i18n.language === "ar" ? "ar" : "en";
  return (
    <div role="group" aria-label={t("language.label")} dir="ltr" className={cn("inline-flex items-center rounded-full border p-0.5", className)}>
      {OPTIONS.map((o) => {
        const active = o.code === current;
        return (
          <button
            key={o.code}
            type="button"
            lang={o.code}
            aria-pressed={active}
            aria-label={o.name}
            onClick={() => { if (!active) void i18n.changeLanguage(o.code); }}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              active ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="sm:hidden">{o.short}</span>
            <span className="hidden sm:inline">{o.name}</span>
          </button>
        );
      })}
    </div>
  );
}
