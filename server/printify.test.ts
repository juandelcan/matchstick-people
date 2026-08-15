import { describe, it, expect } from "vitest";
import {
  normalizeSizeForPrintify,
  PRINTIFY_PRODUCTS,
  validatePrintifyCredentials,
} from "./printify";

describe("Printify module", () => {
  describe("normalizeSizeForPrintify", () => {
    it("maps XS to S", () => {
      expect(normalizeSizeForPrintify("XS")).toBe("S");
    });

    it("maps XXL to 2XL", () => {
      expect(normalizeSizeForPrintify("XXL")).toBe("2XL");
    });

    it("maps XXXL to 3XL", () => {
      expect(normalizeSizeForPrintify("XXXL")).toBe("3XL");
    });

    it("passes through S, M, L, XL unchanged", () => {
      expect(normalizeSizeForPrintify("S")).toBe("S");
      expect(normalizeSizeForPrintify("M")).toBe("M");
      expect(normalizeSizeForPrintify("L")).toBe("L");
      expect(normalizeSizeForPrintify("XL")).toBe("XL");
    });

    it("is case-insensitive", () => {
      expect(normalizeSizeForPrintify("xxl")).toBe("2XL");
      expect(normalizeSizeForPrintify("xl")).toBe("XL");
    });
  });

  describe("PRINTIFY_PRODUCTS", () => {
    it("has white-tee product with correct Printify product ID", () => {
      expect(PRINTIFY_PRODUCTS["white-tee"]).toBeDefined();
      expect(PRINTIFY_PRODUCTS["white-tee"].productId).toBe("660c83c9a393afffac0a0e50");
    });

    it("has black-tee product with correct Printify product ID", () => {
      expect(PRINTIFY_PRODUCTS["black-tee"]).toBeDefined();
      expect(PRINTIFY_PRODUCTS["black-tee"].productId).toBe("660c855dbf70444c780a6f55");
    });

    it("white-tee has variant IDs for all standard sizes", () => {
      const { variantMap } = PRINTIFY_PRODUCTS["white-tee"];
      expect(variantMap["S"]).toBe(12102);
      expect(variantMap["M"]).toBe(12101);
      expect(variantMap["L"]).toBe(12100);
      expect(variantMap["XL"]).toBe(12103);
      expect(variantMap["2XL"]).toBe(12104);
      expect(variantMap["3XL"]).toBe(12105);
    });

    it("black-tee has variant IDs for all standard sizes", () => {
      const { variantMap } = PRINTIFY_PRODUCTS["black-tee"];
      expect(variantMap["S"]).toBe(12126);
      expect(variantMap["M"]).toBe(12125);
      expect(variantMap["L"]).toBe(12124);
      expect(variantMap["XL"]).toBe(12127);
      expect(variantMap["2XL"]).toBe(12128);
      expect(variantMap["3XL"]).toBe(12129);
    });
  });

  describe("validatePrintifyCredentials", () => {
    it("returns true when PRINTIFY_API_TOKEN is valid", async () => {
      const isValid = await validatePrintifyCredentials();
      expect(isValid).toBe(true);
    }, 10000);
  });
});
