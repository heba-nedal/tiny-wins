import { useTranslation } from "react-i18next";
import growthStaircase from "@/assets/growth-staircase-transparent.png.asset.json";

export function GrowthStaircase({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <img
      src={growthStaircase.url}
      alt={t("illustration.staircaseAlt")}
      width={1200}
      height={707}
      loading="eager"
      className={`h-auto w-full max-w-[560px] object-contain rtl:-scale-x-100 ${className}`}
    />
  );
}
