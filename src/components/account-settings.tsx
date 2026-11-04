import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { accountDisplayName, accountInitials, displayNameUpdate, DISPLAY_NAME_MAX } from "@/lib/account";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettings() {
  const { user, refreshUser, signOut } = useAccount();
  const { t } = useTranslation();
  const storedName = accountDisplayName(user);
  const [value, setValue] = useState(storedName);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setValue(storedName); }, [storedName]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || value.trim() === storedName) return;
    if (value.trim().length > DISPLAY_NAME_MAX) { toast.error(t("settings.nameTooLong", { max: DISPLAY_NAME_MAX })); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser(displayNameUpdate(value));
      if (error || !data.user) { toast.error(t("settings.saveError")); return; }
      refreshUser(data.user);
      setValue(accountDisplayName(data.user));
      toast.success(t("settings.saved"));
    } catch { toast.error(t("settings.saveError")); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div><h1 className="text-4xl font-semibold">{t("settings.title")}</h1><p className="mt-1 text-muted-foreground">{t("settings.subtitle")}</p></div>
      <section className="space-y-5 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">{t("settings.profile")}</h2>
        <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground"><span dir="auto">{accountInitials(user)}</span></div>
        <form onSubmit={save} className="max-w-md space-y-3">
          <Label htmlFor="display-name">{t("settings.nameLabel")}</Label>
          <Input id="display-name" value={value} onChange={(e) => setValue(e.target.value)} maxLength={DISPLAY_NAME_MAX} placeholder={t("settings.namePlaceholder")} dir={value ? "auto" : undefined} aria-describedby="name-hint" />
          <p id="name-hint" className="text-sm text-muted-foreground">{t("settings.nameHint")}</p>
          <Button type="submit" disabled={saving || value.trim() === storedName}>{t(saving ? "settings.saving" : "settings.save")}</Button>
        </form>
      </section>
      <section className="space-y-3 rounded-lg border bg-card p-6">
        <Label htmlFor="account-email">{t("settings.emailLabel")}</Label>
        <Input id="account-email" readOnly value={user.email ?? ""} dir="ltr" className="max-w-md text-start" aria-describedby="email-note" />
        <p id="email-note" className="text-sm text-muted-foreground">{t("settings.emailNote")}</p>
      </section>
      <section className="space-y-3 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">{t("settings.languageLabel")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.languageHint")}</p>
        <LanguageSwitcher />
      </section>
      <Button variant="secondary" onClick={() => { void signOut(); }}><LogOut className="rtl:-scale-x-100" />{t("nav.signOut")}</Button>
    </div>
  );
}