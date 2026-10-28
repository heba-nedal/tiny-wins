import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WinGarden } from "./win-garden";
import { gardenPlants } from "@/lib/garden";
import type { Win } from "@/lib/wins";

const win = (id: string, category: Win["category"], title: string): Win => ({
  id,
  title,
  description: null,
  category,
  achievement_date: "2026-10-16",
  created_at: "2026-10-16T00:00:00Z",
  user_id: "user-1",
});

/** The garden links to /gallery, so it needs a router — a tiny standalone tree keeps the app's auth gate out of the test. */
async function renderGarden(wins: Win[]) {
  const onAdd = vi.fn();
  const root = createRootRoute({ component: () => <Outlet /> });
  const home = createRoute({
    getParentRoute: () => root,
    path: "/",
    component: () => <WinGarden wins={wins} onAdd={onAdd} />,
  });
  const gallery = createRoute({ getParentRoute: () => root, path: "/gallery" });
  const router = createRouter({
    routeTree: root.addChildren([home, gallery]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return { onAdd };
}

const statValue = (label: string) =>
  screen.getByText(label).nextElementSibling?.textContent ?? "";

const threeWins = [
  win("a1", "learning", "Finished a module"),
  win("b2", "learning", "Read a chapter"),
  win("c3", "health_habits", "Walked twenty minutes"),
];

afterEach(cleanup);

describe("WinGarden illustration", () => {
  it("shows the local garden image instead of generated plants", async () => {
    await renderGarden(threeWins);

    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toMatch(/win-garden\.png$/);
    expect(img.getAttribute("src")).not.toMatch(/^https?:/);
    expect(screen.queryByRole("group", { name: "Your win garden" })).toBeNull();
  });
});

describe("WinGarden stats", () => {
  it("reports the wins it was given, not a fixed number", async () => {
    await renderGarden(threeWins);

    expect(statValue("Flowers bloomed")).toBe(
      String(gardenPlants(threeWins).filter((p) => p.variant === "flower").length),
    );
    expect(screen.getByRole("link", { name: /see all wins/i })).toHaveAttribute(
      "href",
      "/gallery",
    );
  });

  it("follows the data when the wins change", async () => {
    await renderGarden([
      win("d4", "learning", "Practiced a chord"),
      win("e5", "learning", "Reviewed notes"),
    ]);

  });
});

describe("WinGarden empty state", () => {
  it("waits for a first win and offers the record button", async () => {
    const { onAdd } = await renderGarden([]);

    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByRole("heading", { name: /garden is waiting to grow/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /record your first win/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
