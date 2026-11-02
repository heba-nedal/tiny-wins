import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ read: vi.fn(), create: vi.fn(), unlink: vi.fn(), success: vi.fn() }));
vi.mock("@/lib/telegram", async (load) => ({ ...await load<typeof import("@/lib/telegram")>(), readTelegramLink: mocks.read, createTelegramLink: mocks.create, unlinkTelegram: mocks.unlink }));
vi.mock("sonner", () => ({ toast: { success: mocks.success } }));
import { TelegramLinkCard } from "./telegram-link-card";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.read.mockResolvedValue(null);
  mocks.create.mockResolvedValue({ token: "test-token", expires_at: new Date(Date.now() + 10000).toISOString() });
  mocks.unlink.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Telegram linking states", () => {
  it("waits for initial status before offering a link", async () => {
    let resolve: (value: null) => void = () => {};
    mocks.read.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<TelegramLinkCard />);
    expect(screen.queryByRole("button", { name: "Link Telegram" })).toBeNull();
    await act(async () => resolve(null));
    expect(screen.getByRole("button", { name: "Link Telegram" })).toBeEnabled();
  });
  it("creates a link on demand and polls every three seconds until linked", async () => {
    render(<TelegramLinkCard />);
    const connect = await screen.findByRole("button", { name: "Link Telegram" });
    vi.useFakeTimers();
    await act(async () => { fireEvent.click(connect); });
    const open = screen.getByRole("link", { name: "Open Telegram" });
    expect(open).toHaveAttribute("href", "https://t.me/TinyWinsGallery_bot?start=test-token");
    expect(open).toHaveAttribute("rel", "noopener noreferrer");
    mocks.read.mockResolvedValue({ linked_at: "2026-11-02" });
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(mocks.read).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Unlink" })).toBeEnabled();
    await act(async () => { await vi.advanceTimersByTimeAsync(6000); });
    expect(mocks.read).toHaveBeenCalledTimes(2);
    expect(mocks.success).toHaveBeenCalledOnce();
  });
  it("stops polling at expiry and allows a new link", async () => {
    mocks.create.mockResolvedValue({ token: "test-token", expires_at: new Date(Date.now() + 2000).toISOString() });
    render(<TelegramLinkCard />);
    const connect = await screen.findByRole("button", { name: "Link Telegram" });
    vi.useFakeTimers();
    await act(async () => { fireEvent.click(connect); });
    expect(screen.getByRole("link", { name: "Open Telegram" })).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(6000); });
    expect(screen.getByRole("button", { name: "Create a new link" })).toBeEnabled();
    expect(mocks.read).toHaveBeenCalledTimes(1);
  });
  it("requires confirmation to unlink then returns to the unlinked state", async () => {
    mocks.read.mockResolvedValue({ linked_at: "2026-11-02" });
    render(<TelegramLinkCard />);
    fireEvent.click(await screen.findByRole("button", { name: "Unlink" }));
    expect(mocks.unlink).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Unlink" }).at(-1) as HTMLElement);
    await screen.findByRole("button", { name: "Link Telegram" });
    expect(mocks.unlink).toHaveBeenCalledOnce();
  });
  it("shows a translated error without exposing details", async () => {
    mocks.create.mockRejectedValue(new Error("private provider error"));
    render(<TelegramLinkCard />);
    fireEvent.click(await screen.findByRole("button", { name: "Link Telegram" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Couldn't create a link. Please try again."));
  });
  it("stops polling on unmount", async () => {
    const view = render(<TelegramLinkCard />);
    fireEvent.click(await screen.findByRole("button", { name: "Link Telegram" }));
    await screen.findByRole("link", { name: "Open Telegram" });
    vi.useFakeTimers();
    view.unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(6000); });
    expect(mocks.read).toHaveBeenCalledTimes(1);
  });
});