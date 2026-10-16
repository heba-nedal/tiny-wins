import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
import { useWins } from "./use-wins";

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