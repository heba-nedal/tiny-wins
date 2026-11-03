import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Win } from "@/lib/wins";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("@/hooks/use-wins", () => ({ useSaveWin: () => ({ mutate: mocks.save, isPending: false }), useDeleteWin: () => ({ mutate: vi.fn() }) }));
vi.mock("./grow-win", () => ({ GrowWin: () => null }));
vi.mock("./monthly-reflection", () => ({ MonthlyReflectionCard: () => null }));
import { WinFormDialog } from "./win-form-dialog";
import { WinCard } from "./win-card";
import { GrowthStory } from "./growth-story";

const win: Win = { id: "win-1", user_id: "user-1", title: "Completed a chapter", description: null, category: "learning", achievement_date: "2026-11-03", created_at: "2026-11-03T12:00:00Z", is_publishable: true, source: "telegram" };
const label = "Okay to use in my weekly LinkedIn draft";
const badge = "Can be used in your LinkedIn draft";
afterEach(cleanup);
beforeEach(() => mocks.save.mockReset());

describe("per-win LinkedIn consent", () => {
  it("defaults off for a new win, including after an enabled edit", () => {
    const { rerender } = render(<WinFormDialog open win={win} onOpenChange={vi.fn()} />);
    rerender(<WinFormDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByRole("switch", { name: label })).toHaveAttribute("aria-checked", "false");
  });
  it("shows the stored enabled value when editing", () => {
    render(<WinFormDialog open win={win} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("switch", { name: label })).toHaveAttribute("aria-checked", "true");
  });
  it("shows the stored disabled value when editing", () => {
    render(<WinFormDialog open win={{ ...win, is_publishable: false }} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("switch", { name: label })).toHaveAttribute("aria-checked", "false");
  });
  it("saves an explicitly disabled value through the unchanged form flow", () => {
    render(<WinFormDialog open win={win} onOpenChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("switch", { name: label }));
    fireEvent.click(screen.getByRole("button", { name: "Save win" }));
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ id: "win-1", is_publishable: false }), expect.any(Object));
  });
  it("shows indicators beside the existing Telegram badge only for enabled wins", () => {
    const { rerender } = render(<WinCard win={win} />);
    expect(screen.getByRole("img", { name: badge })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Added from Telegram" })).toBeInTheDocument();
    rerender(<WinCard win={{ ...win, is_publishable: false }} />);
    expect(screen.queryByRole("img", { name: badge })).toBeNull();
  });
  it("shows timeline indicators only for enabled wins", () => {
    const props = { isLoading: false, error: null, onRetry: vi.fn(), onAdd: vi.fn() };
    const { rerender } = render(<GrowthStory {...props} wins={[win]} />);
    expect(screen.getByRole("img", { name: badge })).toBeInTheDocument();
    rerender(<GrowthStory {...props} wins={[{ ...win, is_publishable: false }]} />);
    expect(screen.queryByRole("img", { name: badge })).toBeNull();
  });
});