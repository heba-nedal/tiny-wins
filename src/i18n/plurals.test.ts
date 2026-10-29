import { describe, expect, it } from "vitest";
import i18n from "@/i18n";

describe("Arabic plural resolution", () => {
  it.each([
    [0, "_zero"],
    [1, "_one"],
    [2, "_two"],
    [3, "_few"],
    [11, "_many"],
    [100, "_other"],
  ])("resolves count %i to %s", (count, suffix) => {
    expect(i18n.services.pluralResolver.getSuffix("ar", count)).toBe(suffix);
  });
});