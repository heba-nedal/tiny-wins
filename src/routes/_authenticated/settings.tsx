import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n";
import { AccountSettings } from "@/components/account-settings";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [
    { title: i18n.t("meta.settings.title") },
    { name: "description", content: i18n.t("meta.settings.description") },
    { property: "og:title", content: i18n.t("meta.settings.title") },
    { property: "og:description", content: i18n.t("meta.settings.description") },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AccountSettings,
});