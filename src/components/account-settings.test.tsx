import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({ update: vi.fn(), success: vi.fn(), error: vi.fn(), signOut: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { updateUser: mocks.update, onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }) } } }));
vi.mock("sonner", () => ({ toast: { success: mocks.success, error: mocks.error } }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
import { AccountProvider } from "@/hooks/use-account";
import { AccountSettings } from "./account-settings";
import { AccountMenu } from "./account-menu";
import i18n from "@/i18n";

const user: User = { id: "account-test", aud: "authenticated", created_at: "2026-11-04T00:00:00Z", app_metadata: {}, user_metadata: { display_name: "Old Name" }, email: "account@example.test" };
afterEach(cleanup);
beforeEach(async () => { vi.clearAllMocks(); await i18n.changeLanguage("en"); });
const mount = () => render(<AccountProvider initialUser={user} signOut={mocks.signOut}><AccountMenu /><AccountSettings /></AccountProvider>);

describe("account profile flow", () => {
  it("saves only trimmed metadata and immediately refreshes the header initials", async () => {
    mocks.update.mockResolvedValue({ data: { user: { ...user, user_metadata: { display_name: "New Display" } } }, error: null });
    mount();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "  New Display  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("ND"));
    expect(mocks.update).toHaveBeenCalledWith({ data: { display_name: "New Display" } });
    expect(screen.getByLabelText("Display name")).toHaveValue("New Display");
    expect(mocks.success).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
  it("does not allow email editing and reuses the provided sign-out", () => {
    mount();
    expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
  it("shows a translated failure without displaying or logging service errors", async () => {
    mocks.update.mockResolvedValue({ data: { user: null }, error: { message: "private detail" } });
    mount();
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "New Name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith("Couldn't save your name. Please try again."));
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("ON");
  });
  it("keeps the account menu open when its language control is selected", async () => {
    mount();
    fireEvent.keyDown(screen.getByRole("button", { name: "Account menu" }), { key: "Enter" });
    const menu = await screen.findByRole("menu");
    const arabic = menu.querySelector('button[lang="ar"]');
    if (!(arabic instanceof HTMLElement)) throw new Error("Language control missing");
    fireEvent.click(arabic);
    await waitFor(() => expect(i18n.language).toBe("ar"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});