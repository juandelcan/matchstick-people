import { ENV } from "./_core/env";

const PRINTIFY_BASE = "https://api.printify.com/v1";

// ── Product & Variant Map ────────────────────────────────────────────────────
// Discovered via API on 2026-03-01
// Shop ID: 15225068 (The Matchstick People)
//
// Product: White Tee (black matchstick figures + red flame design)
//   Printify Product ID: 660c83c9a393afffac0a0e50
//
// Product: Black Tee (white matchstick figures + red flame design)
//   Printify Product ID: 660c855dbf70444c780a6f55

export const PRINTIFY_PRODUCTS: Record<
  string,
  { productId: string; variantMap: Record<string, number> }
> = {
  "white-tee": {
    productId: "660c83c9a393afffac0a0e50",
    variantMap: {
      S:   12102,
      M:   12101,
      L:   12100,
      XL:  12103,
      "2XL": 12104,
      "3XL": 12105,
      "4XL": 24031,
      "5XL": 24164,
    },
  },
  "black-tee": {
    productId: "660c855dbf70444c780a6f55",
    variantMap: {
      S:   12126,
      M:   12125,
      L:   12124,
      XL:  12127,
      "2XL": 12128,
      "3XL": 12129,
      "4XL": 24039,
      "5XL": 24171,
    },
  },
};

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyLineItem {
  productId: string;  // our internal ID: "white-tee" | "black-tee"
  size: string;       // "S" | "M" | "L" | "XL" | "2XL" | "3XL"
  quantity: number;
}

export interface PrintifyOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Normalize display size labels to Printify's size labels.
 * The shop UI uses XS/S/M/L/XL/XXL; Printify uses S/M/L/XL/2XL/3XL.
 */
export function normalizeSizeForPrintify(displaySize: string): string {
  const map: Record<string, string> = {
    XS: "S",   // Printify doesn't have XS on this blank; map to S
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    XXL: "2XL",
    XXXL: "3XL",
    "2XL": "2XL",
    "3XL": "3XL",
  };
  return map[displaySize.toUpperCase()] ?? displaySize;
}

/**
 * Submit an order to Printify for fulfillment.
 * Called from the Stripe webhook after a successful payment.
 */
export async function submitPrintifyOrder(
  externalOrderId: string,
  address: PrintifyAddress,
  items: PrintifyLineItem[]
): Promise<PrintifyOrderResult> {
  const token = ENV.printifyApiToken;
  const shopId = ENV.printifyShopId;

  if (!token || !shopId) {
    return { success: false, error: "Printify credentials not configured" };
  }

  // Build line items for Printify
  const printifyItems = [];
  for (const item of items) {
    const product = PRINTIFY_PRODUCTS[item.productId];
    if (!product) {
      console.error(`[Printify] Unknown productId: ${item.productId}`);
      return { success: false, error: `Unknown product: ${item.productId}` };
    }
    const variantId = product.variantMap[item.size];
    if (!variantId) {
      console.error(`[Printify] Unknown size ${item.size} for product ${item.productId}`);
      return { success: false, error: `Unknown size ${item.size} for ${item.productId}` };
    }
    printifyItems.push({
      product_id: product.productId,
      variant_id: variantId,
      quantity: item.quantity,
    });
  }

  const payload = {
    external_id: externalOrderId,
    label: `Order ${externalOrderId}`,
    line_items: printifyItems,
    shipping_method: 1, // Standard shipping
    send_shipping_notification: true,
    address_to: address,
  };

  try {
    const response = await fetch(
      `${PRINTIFY_BASE}/shops/${shopId}/orders.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "TheMatchstickPeople-Website",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      console.error("[Printify] Order creation failed:", JSON.stringify(data));
      return { success: false, error: data?.message ?? "Printify API error" };
    }

    console.log(`[Printify] Order created: ${data.id} for external_id=${externalOrderId}`);

    // Auto-send to production (triggers printing & shipping)
    // Printify requires the order to transition from "pending" to "on-hold" before
    // it can be sent to production. Retry up to 5 times with increasing delays.
    let sent = false;
    let lastSendError = "";
    for (let attempt = 1; attempt <= 5; attempt++) {
      // Wait before attempting: 2s, 4s, 8s, 16s, 32s
      const delay = attempt === 1 ? 2000 : Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const sendResponse = await fetch(
        `${PRINTIFY_BASE}/shops/${shopId}/orders/${data.id}/send_to_production.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "TheMatchstickPeople-Website",
          },
        }
      );

      if (sendResponse.ok) {
        console.log(`[Printify] Order ${data.id} sent to production (attempt ${attempt})`);
        sent = true;
        break;
      }

      const sendData = await sendResponse.json() as any;
      lastSendError = sendData?.errors?.reason ?? sendData?.message ?? "Unknown error";
      console.warn(`[Printify] Send to production attempt ${attempt} failed: ${lastSendError}`);
    }

    if (!sent) {
      console.error("[Printify] Send to production failed after 5 attempts:", lastSendError);
      // Order was created but not sent — still a partial success
      return { success: true, orderId: data.id, error: `Created but not sent to production: ${lastSendError}` };
    }

    return { success: true, orderId: data.id };
  } catch (err: any) {
    console.error("[Printify] Network error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch stock levels for both products.
 * Returns a map of productId -> size -> inStock boolean.
 */
export async function getStockLevels(): Promise<Record<string, Record<string, boolean>>> {
  const token = ENV.printifyApiToken;
  const shopId = ENV.printifyShopId;

  if (!token || !shopId) return {};

  const result: Record<string, Record<string, boolean>> = {};

  for (const [productKey, product] of Object.entries(PRINTIFY_PRODUCTS)) {
    try {
      const res = await fetch(
        `${PRINTIFY_BASE}/shops/${shopId}/products/${product.productId}.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "TheMatchstickPeople-Website",
          },
        }
      );
      if (!res.ok) continue;
      const data = await res.json() as any;

      const sizeStock: Record<string, boolean> = {};
      for (const [size, variantId] of Object.entries(product.variantMap)) {
        const variant = (data.variants ?? []).find((v: any) => v.id === variantId);
        // A variant is in stock if it is enabled and has quantity > 0 (or quantity is not tracked)
        sizeStock[size] = variant ? (variant.is_enabled !== false && (variant.quantity == null || variant.quantity > 0)) : false;
      }
      result[productKey] = sizeStock;
    } catch (err: any) {
      console.error(`[Printify] Failed to fetch stock for ${productKey}:`, err.message);
    }
  }

  return result;
}

/**
 * Validate Printify credentials by fetching shop info.
 * Used in tests to confirm the token is valid.
 */
export async function validatePrintifyCredentials(): Promise<boolean> {
  const token = ENV.printifyApiToken;
  if (!token) return false;
  try {
    const res = await fetch(`${PRINTIFY_BASE}/shops.json`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "TheMatchstickPeople-Website",
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
