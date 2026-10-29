import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/components/brand";
import { GrowthStaircase } from "@/components/growth-staircase";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: i18n.t("meta.landing.title") },
      { name: "description", content: i18n.t("meta.landing.description") },
      { property: "og:title", content: i18n.t("meta.landing.title") },
      { property: "og:description", content: i18n.t("meta.landing.description") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5">
      <header className="flex items-center justify-between py-6">
        <Brand />
        <div className="flex items-center gap-1"><LanguageSwitcher /><Button asChild variant="ghost"><Link to="/auth">{t("landing.signIn")}</Link></Button></div>
      </header>
      <main className="grid flex-1 items-center gap-10 py-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">{t("landing.hero.title1")}<br />{t("landing.hero.title2")}</h1>
          <p className="max-w-md text-lg text-muted-foreground">{t("landing.hero.subtitle")}</p>
          <Button asChild size="lg"><Link to="/dashboard">{t("landing.hero.cta")}</Link></Button>
        </div>
        <GrowthStaircase />
      </main>
    </div>
  );
}
