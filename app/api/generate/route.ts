export const runtime = "nodejs";

import { parseCsv } from "../../../lib/csv/parse";
import { validateRows } from "../../../lib/csv/validate";
import { makeFilename } from "../../../lib/utils/filenames";
import { buildZip } from "../../../lib/zip/build-zip";
import { generateSwishQR } from "../../../lib/swish/generate-qr";
import { applyPreset } from "../../../lib/image/presets";
import { createRateLimiter, getClientIp } from "../../../lib/utils/rate-limit";

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_ROWS = 200;
// Parallel requests to the Swish QR API
const CONCURRENCY = 5;
// Per-IP request budget; each request can fan out to MAX_ROWS Swish calls
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const checkRateLimit = createRateLimiter({
  limit: RATE_LIMIT,
  windowMs: RATE_WINDOW_MS,
});

// Like Promise.all over items.map(fn), but with at most `limit` in flight.
// After the first failure no new items start, so one bad row doesn't keep
// calling Swish for the rest of the file.
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  let failed = false;
  const worker = async () => {
    while (!failed && next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i], i);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export async function POST(req: Request) {
  const { allowed, retryAfterSeconds } = checkRateLimit(getClientIp(req));
  if (!allowed) {
    return Response.json(
      {
        success: false,
        error: `Too many requests. Please wait ${retryAfterSeconds} seconds and try again.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { success: false, error: "Content-Type must be multipart/form-data" },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const presetRaw = formData.get("preset");
    let preset: "plain" | "branded" = "branded";
    if (presetRaw === "plain" || presetRaw === "branded") {
      preset = presetRaw;
    }
    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return Response.json(
        { success: false, error: "Missing file upload" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { success: false, error: "CSV file must be 1 MB or smaller" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const csvText = buffer.toString("utf-8");

    let rows;
    try {
      rows = parseCsv(csvText);
    } catch {
      return Response.json(
        { success: false, error: "Invalid CSV format" },
        { status: 400 },
      );
    }

    if (rows.length > MAX_ROWS) {
      return Response.json(
        {
          success: false,
          error: `CSV can have at most ${MAX_ROWS} rows (got ${rows.length})`,
        },
        { status: 400 },
      );
    }

    const { valid, errors } = validateRows(rows);
    if (errors.length > 0) {
      return Response.json({ success: false, errors }, { status: 400 });
    }

    // Fetch each QR code from Swish and apply the chosen preset.
    // Validation passed, so valid[i] is CSV data row i + 1.
    let images: Buffer[];
    try {
      images = await mapWithLimit(valid, CONCURRENCY, async (row, i) => {
        try {
          const qrBuffer = await generateSwishQR(row);
          return await applyPreset(preset, qrBuffer, row.label);
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "QR/image generation failed";
          const where = row.label ? `Row ${i + 1} (${row.label})` : `Row ${i + 1}`;
          throw new Error(`${where}: ${message}`);
        }
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "QR/image generation failed";
      return Response.json({ success: false, error: message }, { status: 500 });
    }

    const usedFilenames = new Set<string>();
    const files = valid.map((row, i) => ({
      filename: makeFilename(row, i + 1, usedFilenames),
      buffer: images[i],
    }));

    let zipBuffer: Buffer;
    try {
      zipBuffer = await buildZip(files);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ZIP packaging failed";
      return Response.json({ success: false, error: message }, { status: 500 });
    }

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=swish-qr-codes.zip",
      },
    });
  } catch {
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
