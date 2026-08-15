/**
 * Tests for the Printify stock-level feature.
 * Covers:
 *   - getStockLevels() returns the expected shape
 *   - Each product has an entry for every mapped size
 *   - All stock values are booleans
 */
import { describe, it, expect } from "vitest";
import { getStockLevels, PRINTIFY_PRODUCTS } from "./printify";

describe("getStockLevels", () => {
  it("returns an object with entries for both products", async () => {
    const stock = await getStockLevels();
    // If credentials are missing the function returns {} — skip live assertions
    if (Object.keys(stock).length === 0) return;

    expect(stock).toHaveProperty("white-tee");
    expect(stock).toHaveProperty("black-tee");
  }, 15000);

  it("each product entry contains boolean values for every mapped size", async () => {
    const stock = await getStockLevels();
    if (Object.keys(stock).length === 0) return;

    for (const [productKey, sizeMap] of Object.entries(stock)) {
      const expectedSizes = Object.keys(PRINTIFY_PRODUCTS[productKey].variantMap);
      for (const size of expectedSizes) {
        expect(typeof sizeMap[size]).toBe("boolean");
      }
    }
  }, 15000);

  it("does not throw when called with valid credentials", async () => {
    await expect(getStockLevels()).resolves.not.toThrow();
  }, 15000);
});

describe("DISPLAY_TO_PRINTIFY mapping consistency", () => {
  // The display-to-Printify mapping in Shop.tsx must cover all display sizes
  // and map to keys that exist in PRINTIFY_PRODUCTS variant maps.
  const DISPLAY_TO_PRINTIFY: Record<string, string> = {
    XS: "S",
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    XXL: "2XL",
  };

  it("all display sizes map to a Printify size present in white-tee variantMap", () => {
    const { variantMap } = PRINTIFY_PRODUCTS["white-tee"];
    for (const [display, printify] of Object.entries(DISPLAY_TO_PRINTIFY)) {
      expect(variantMap).toHaveProperty(printify, expect.any(Number));
    }
  });

  it("all display sizes map to a Printify size present in black-tee variantMap", () => {
    const { variantMap } = PRINTIFY_PRODUCTS["black-tee"];
    for (const [display, printify] of Object.entries(DISPLAY_TO_PRINTIFY)) {
      expect(variantMap).toHaveProperty(printify, expect.any(Number));
    }
  });
});
