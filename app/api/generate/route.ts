export const runtime = "nodejs";

import { parseCsv } from "../../../lib/csv/parse";
import { validateRows } from "../../../lib/csv/validate";
import { makeFilename } from "../../../lib/utils/filenames";
import { buildZip } from "../../../lib/zip/build-zip";
import { generateSwishQR } from "../../../lib/swish/generate-qr";
import { applyPreset } from "../../../lib/image/presets";
import {
  CodedError,
  type ErrorCode,
  type ErrorParams,
} from "../../../lib/utils/errors";
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

function errorResponse(
  status: number,
  code: ErrorCode,
  params?: ErrorParams,
  headers?: Record<string, string>,
) {
  return Response.json(
    { success: false, error: { code, params } },
    { status, headers },
  );
}

export async function POST(req: Request) {
  const { allowed, retryAfterSeconds } = checkRateLimit(getClientIp(req));
  if (!allowed) {
    return errorResponse(
      429,
      "rateLimited",
      { seconds: retryAfterSeconds },
      { "Retry-After": String(retryAfterSeconds) },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return errorResponse(400, "notMultipart");
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const presetRaw = formData.get("preset");
    let preset: "plain" | "branded" = "branded";
    if (presetRaw === "plain" || presetRaw === "branded") {
      preset = presetRaw;
    }
    // Locked unless the form explicitly says otherwise
    const lockMessage = formData.get("lockMessage") !== "false";
    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return errorResponse(400, "missingFile");
    }

    if (file.size > MAX_FILE_BYTES) {
      return errorResponse(400, "fileTooLarge", {
        maxMb: MAX_FILE_BYTES / (1024 * 1024),
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const csvText = buffer.toString("utf-8");

    let rows;
    try {
      rows = parseCsv(csvText);
    } catch {
      return errorResponse(400, "invalidCsv");
    }

    if (rows.length > MAX_ROWS) {
      return errorResponse(400, "tooManyRows", {
        max: MAX_ROWS,
        count: rows.length,
      });
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
          const qrBuffer = await generateSwishQR(row, { lockMessage });
          return await applyPreset(preset, qrBuffer, row.label);
        } catch (err: unknown) {
          throw new CodedError("generationFailed", {
            row: i + 1,
            ...(row.label ? { label: row.label } : {}),
            detail: err instanceof Error ? err.message : "Unknown error",
          });
        }
      });
    } catch (err: unknown) {
      if (err instanceof CodedError) {
        return errorResponse(500, err.code, err.params);
      }
      return errorResponse(500, "internal");
    }

    const usedFilenames = new Set<string>();
    const files = valid.map((row, i) => ({
      filename: makeFilename(row, i + 1, usedFilenames),
      buffer: images[i],
    }));

    let zipBuffer: Buffer;
    try {
      zipBuffer = await buildZip(files);
    } catch {
      return errorResponse(500, "zipFailed");
    }

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=swish-qr-codes.zip",
      },
    });
  } catch {
    return errorResponse(500, "internal");
  }
}
