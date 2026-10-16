import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Brand, StepsIllustration } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Tiny Wins" },
      { name: "description", content: "Sign in or create your Tiny Wins account." },
      { property: "og:title", content: "Sign in · Tiny Wins" },
      { property: "og:description", content: "Sign in or create your Tiny Wins account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      navigate({ to: "/dashboard" });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) navigate({ to: "/dashboard" });
      else setSent(true);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sand/40 p-12 md:flex">
        <Link to="/"><Brand /></Link>
        <StepsIllustration className="w-full max-w-md" />
        <p className="font-display text-2xl text-heading">Every little achievement deserves a place.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="md:hidden"><Brand /></div>
          {sent ? (
            <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-soft">
              <h1 className="text-2xl font-semibold">Check your email</h1>
              <p className="text-muted-foreground">We sent a confirmation link to {email}. Open it to finish signing up.</p>
              <Button variant="outline" onClick={() => { setSent(false); setMode("in"); }}>Back to sign in</Button>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-semibold">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
                <p className="mt-1 text-muted-foreground">{mode === "in" ? "Sign in to see your wins." : "Start celebrating the small stuff."}</p>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                {mode === "in" ? "New here?" : "Already have an account?"}{" "}
                <button className="font-medium text-primary hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
                  {mode === "in" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
