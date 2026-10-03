import type { PaymentRow } from "../csv/types";
import { toSwishPayload } from "./payload";

const SWISH_QR_URL = "https://mpc.getswish.net/qrg-swish/api/v1/prefilled";

export async function generateSwishQR(row: PaymentRow): Promise<Buffer> {
  let response: Response;
  try {
    response = await fetch(SWISH_QR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSwishPayload(row)),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Swish QR generation failed: ${msg}`);
  }
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 200);
    throw new Error(
      `Swish QR generation failed: HTTP ${response.status}${detail ? ` ${detail}` : ""}`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}
