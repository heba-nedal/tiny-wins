import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LogOut, Settings } from "lucide-react";
import { useAccount } from "@/hooks/use-account";
import { accountDisplayName, accountInitials } from "@/lib/account";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const { user, signOut } = useAccount();
  const { t, i18n } = useTranslation();
  return (
    <DropdownMenu dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="size-9 shrink-0 rounded-full" aria-label={t("account.menuLabel")}>
          <span dir="auto">{accountInitials(user)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
        <div className="min-w-0 px-2 py-2">
          <p dir="auto" className="truncate text-sm font-medium">{accountDisplayName(user) || t("account.defaultName")}</p>
          <p dir="ltr" className="truncate text-start text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/settings"><Settings />{t("account.settings")}</Link></DropdownMenuItem>
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2">
          <span className="text-sm">{t("settings.languageLabel")}</span>
          <LanguageSwitcher />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { void signOut(); }}><LogOut className="rtl:-scale-x-100" />{t("nav.signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}