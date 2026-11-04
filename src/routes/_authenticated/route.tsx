import { useTranslation } from "react-i18next";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/brand";
import { AccountMenu } from "@/components/account-menu";
import { AccountProvider } from "@/hooks/use-account";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { accountUser: data.user };
  },
  component: Layout,
});

function Layout() {
  const { accountUser } = Route.useRouteContext();
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
    <AccountProvider initialUser={accountUser} signOut={signOut}>
    <div className="min-h-screen">
      <header className="border-b bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link to="/dashboard"><Brand /></Link>
          <nav className="flex max-w-full flex-wrap items-center gap-1">
            <Link to="/dashboard" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.dashboard")}</Link>
            <Link to="/gallery" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.gallery")}</Link>
            <Link to="/letters" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.letters")}</Link>
            <Link to="/assistant" className={nav} activeProps={{ className: "bg-sage text-heading" }}>{t("nav.assistant")}</Link>
            <AccountMenu />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10"><Outlet /></main>
    </div>
    </AccountProvider>
  );
}
