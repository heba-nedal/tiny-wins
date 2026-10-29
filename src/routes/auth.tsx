import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authErrorMessage } from "@/lib/auth-errors";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/brand";
import { GrowthStaircase } from "@/components/growth-staircase";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: i18n.t("meta.auth.title") },
      { name: "description", content: i18n.t("meta.auth.description") },
      { property: "og:title", content: i18n.t("meta.auth.title") },
      { property: "og:description", content: i18n.t("meta.auth.description") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error(t("auth.passwordShort")); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(authErrorMessage(error, t)); return; }
      navigate({ to: "/dashboard" });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
      setBusy(false);
      if (error) { toast.error(authErrorMessage(error, t)); return; }
      if (data.session) navigate({ to: "/dashboard" });
      else setSent(true);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sand/40 p-12 md:flex">
        <Link to="/"><Brand /></Link>
        <GrowthStaircase />
        <p className="font-display text-2xl text-heading">{t("auth.tagline")}</p>
      </div>
      <div className="relative flex items-center justify-center p-6">
        <LanguageSwitcher className="absolute end-4 top-4" />
        <div className="w-full max-w-sm space-y-6">
          <div className="md:hidden"><Brand /></div>
          {sent ? (
            <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-soft">
              <h1 className="text-2xl font-semibold">{t("auth.checkEmail.title")}</h1>
              <p className="text-muted-foreground">{t("auth.checkEmail.body", { email: "\u2068" + email + "\u2069" })}</p>
              <Button variant="outline" onClick={() => { setSent(false); setMode("in"); }}>{t("auth.checkEmail.back")}</Button>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-semibold">{t(mode === "in" ? "auth.signIn.title" : "auth.signUp.title")}</h1>
                <p className="mt-1 text-muted-foreground">{t(mode === "in" ? "auth.signIn.subtitle" : "auth.signUp.subtitle")}</p>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" dir="ltr" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Input id="password" dir="ltr" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? t("auth.wait") : t(mode === "in" ? "auth.signIn.submit" : "auth.signUp.submit")}</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                {t(mode === "in" ? "auth.signIn.switchPrompt" : "auth.signUp.switchPrompt")}{" "}
                <button className="font-medium text-primary hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
                  {t(mode === "in" ? "auth.signIn.switchAction" : "auth.signUp.switchAction")}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
