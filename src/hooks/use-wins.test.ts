import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
import { useSaveWin, useWins } from "./use-wins";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }, children);
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ order: mocks.order });
  mocks.order.mockReturnValueOnce({ order: mocks.order }).mockResolvedValueOnce({ data: [], error: null });
});
describe("persisted LinkedIn consent", () => {
  const payload = { title: "Completed a chapter", description: null, category: "learning" as const, achievement_date: "2026-11-03", is_publishable: true };
  it("includes explicit consent in new achievement inserts", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "current-user" } } });
    const { result } = renderHook(useSaveWin, { wrapper });
    await result.current.mutateAsync(payload);
    expect(insert).toHaveBeenCalledWith({ ...payload, user_id: "current-user" });
  });
  it("includes disabled consent in achievement updates", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mocks.from.mockReturnValue({ update });
    const { result } = renderHook(useSaveWin, { wrapper });
    await result.current.mutateAsync({ ...payload, id: "win-1", is_publishable: false });
    expect(update).toHaveBeenCalledWith({ ...payload, is_publishable: false });
    expect(eq).toHaveBeenCalledWith("id", "win-1");
  });
  it("reads the stored consent value with the existing wins query", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "current-user" } }, error: null });
    mocks.order.mockReset().mockReturnValueOnce({ order: mocks.order }).mockResolvedValueOnce({ data: [{ ...payload, id: "win-1" }], error: null });
    const { result } = renderHook(useWins, { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.select).toHaveBeenCalledWith("*");
    expect(result.current.data?.[0]?.is_publishable).toBe(true);
  });
});
describe("owned progress records", () => {
  it("scopes achievement reads to the authenticated user", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "current-user" } }, error: null });
    const { result } = renderHook(useWins, { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "current-user");
  });
  it("does not read achievements without a signed-in user", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const { result } = renderHook(useWins, { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.from).not.toHaveBeenCalled();
  });
});