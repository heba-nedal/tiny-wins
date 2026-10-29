import { useTranslation } from "react-i18next";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

function Layout() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  const nav = "rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-heading";
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link to="/dashboard"><Brand /></Link>
          <nav className="flex items-center gap-1">
            <Link to="/dashboard" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.dashboard")}</Link>
            <Link to="/gallery" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.gallery")}</Link>
            <Link to="/letters" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.letters")}</Link>
            <span className="mx-2 hidden h-5 w-px bg-border sm:block" aria-hidden />
            <LanguageSwitcher className="me-1" />
            <Button variant="ghost" size="sm" onClick={signOut} aria-label={t("nav.signOut")}><LogOut className="rtl:-scale-x-100" /> <span className="hidden sm:inline">{t("nav.signOut")}</span></Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10"><Outlet /></main>
    </div>
  );
}
