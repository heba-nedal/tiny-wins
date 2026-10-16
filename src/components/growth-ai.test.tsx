import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonthlyReflectionCard } from "./monthly-reflection";
import { GrowWin } from "./grow-win";

const mocks = vi.hoisted(() => ({ monthly: vi.fn(), win: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/growth-ai.functions", () => ({ getMonthlyReflection: mocks.monthly, getWinReflection: mocks.win }));
afterEach(cleanup);
beforeEach(() => { mocks.monthly.mockReset(); mocks.win.mockReset(); });

describe("explicit AI interactions", () => {
  it("does not generate on mount or month selection, and clears old results", async () => {
    mocks.monthly.mockResolvedValue({ status: "success", reflection: { month: "2026-09", count: 1, review: "September review", patterns: "Limited data", celebratedTitle: "Learning module", celebration: "Completed", nextStep: "Apply a concept" } });
    render(<MonthlyReflectionCard />);
    fireEvent.change(screen.getByLabelText("Month"), { target: { value: "2026-09" } });
    expect(mocks.monthly).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Generate My Monthly Reflection" }));
    await screen.findByText("September review");
    expect(mocks.monthly).toHaveBeenCalledWith({ data: { month: "2026-09" } });
    fireEvent.change(screen.getByLabelText("Month"), { target: { value: "2026-10" } });
    expect(screen.queryByText("September review")).toBeNull();
    expect(mocks.monthly).toHaveBeenCalledTimes(1);
  });
  it("blocks repeated monthly clicks while a request is pending", async () => {
    let resolve: (value: unknown) => void = () => {};
    mocks.monthly.mockImplementation(() => new Promise((done) => { resolve = done; }));
    render(<MonthlyReflectionCard />);
    const button = screen.getByRole("button", { name: "Generate My Monthly Reflection" });
    fireEvent.click(button); fireEvent.click(button);
    expect(mocks.monthly).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ status: "empty", message: "No wins this month" }));
    expect(screen.getByText("No wins this month")).toBeInTheDocument();
  });
  it("does not analyze on opening details and sends only the selected ID", async () => {
    mocks.win.mockResolvedValue({ status: "success", reflection: { shows: "Completed a module", buildOn: "Apply a concept", nextStep: "Practice for 10 minutes", why: "Use your new knowledge" } });
    render(<GrowWin id="selected-id" />);
    expect(mocks.win).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Grow This Win ✨" }));
    await screen.findByText("Practice for 10 minutes");
    expect(mocks.win).toHaveBeenCalledWith({ data: { id: "selected-id" } });
  });
  it("blocks concurrent per-win requests and supports explicit error recovery", async () => {
    let resolve: (value: unknown) => void = () => {};
    mocks.win.mockImplementation(() => new Promise((done) => { resolve = done; }));
    render(<GrowWin id="selected-id" />);
    const button = screen.getByRole("button", { name: "Grow This Win ✨" });
    fireEvent.click(button); fireEvent.click(button);
    expect(mocks.win).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ status: "error", message: "AI is busy" }));
    expect(screen.getByRole("alert")).toHaveTextContent("AI is busy");
    fireEvent.click(screen.getByRole("button", { name: "Try Grow This Win Again" }));
    expect(mocks.win).toHaveBeenCalledTimes(2);
    await act(async () => resolve({ status: "empty", message: "Win unavailable" }));
  });
});