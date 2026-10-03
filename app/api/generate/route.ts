export const runtime = "nodejs";

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_ROWS = 200;
// Parallel requests to the Swish QR API
const CONCURRENCY = 5;

// Like Promise.all over items.map(fn), but with at most `limit` in flight.
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

import { parseCsv } from "../../../lib/csv/parse";
import { validateRows } from "../../../lib/csv/validate";
import { makeFilename } from "../../../lib/utils/filenames";
import { buildZip } from "../../../lib/zip/build-zip";
import { generateSwishQR } from "../../../lib/swish/generate-qr";
import { applyPreset } from "../../../lib/image/presets";

export async function POST(req: Request) {
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

    // Step 3.4: Generate Swish QR and compose branded images for each valid row
    let images: Buffer[];
    try {
      images = await mapWithLimit(valid, CONCURRENCY, async (row) => {
        const qrBuffer = await generateSwishQR(row);
        return applyPreset(preset, qrBuffer, row.label);
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

    // Step 5.3: Build ZIP
    let zipBuffer: Buffer;
    try {
      zipBuffer = await buildZip(files);
    } catch (err: unknown) {
      let message = "ZIP packaging failed";
      if (typeof err === "object" && err !== null && "message" in err && typeof (err as { message?: unknown }).message === "string") {
        message = (err as { message: string }).message;
      }
      return Response.json(
        { success: false, error: message },
        { status: 500 },
      );
    }

    // Step 5.4: Return ZIP as downloadable response
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
