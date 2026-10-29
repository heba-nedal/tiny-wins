import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      lang={isAr ? "en" : "ar"}
      aria-label={t("language.switchLabel")}
      onClick={() => void i18n.changeLanguage(isAr ? "en" : "ar")}
    >
      {isAr ? "English" : "العربية"}
    </Button>
  );
}
