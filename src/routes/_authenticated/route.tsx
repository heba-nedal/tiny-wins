import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

function Layout() {
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
            <Link to="/dashboard" className={nav} activeProps={{ className: "bg-sage text-heading" }}>Dashboard</Link>
            <Link to="/gallery" className={nav} activeProps={{ className: "bg-sage text-heading" }}>Gallery</Link>
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out"><LogOut /> <span className="hidden sm:inline">Sign out</span></Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10"><Outlet /></main>
    </div>
  );
}
