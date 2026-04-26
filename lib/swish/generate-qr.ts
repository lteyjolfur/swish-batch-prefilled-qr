import axios from "axios";
import type { PaymentRow } from "../csv/types";
import { toSwishPayload } from "./payload";

export async function generateSwishQR(row: PaymentRow): Promise<Buffer> {
  try {
    const payload = toSwishPayload(row);
    console.debug("Swish API payload:", JSON.stringify(payload));
    const response = await axios.post(
      "https://mpc.getswish.net/qrg-swish/api/v1/prefilled",
      payload,
      { responseType: "arraybuffer" },
    );
    return Buffer.from(response.data);
  } catch (error: any) {
    const msg =
      error?.response?.data?.message || error.message || "Unknown error";
    throw new Error(`Swish QR generation failed: ${msg}`);
  }
}
