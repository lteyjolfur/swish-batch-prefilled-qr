export const runtime = "nodejs";

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

    const { valid, errors } = validateRows(rows);
    if (errors.length > 0) {
      return Response.json({ success: false, errors }, { status: 400 });
    }

    // Step 3.4: Generate Swish QR and compose branded images for each valid row
    const files: { filename: string; buffer: Buffer }[] = [];
    for (let i = 0; i < valid.length; i++) {
      const row = valid[i];
      let qrBuffer: Buffer;
      let imageBuffer: Buffer;
      try {
        qrBuffer = await generateSwishQR(row);
        imageBuffer = await applyPreset(preset, qrBuffer, row.label);
      } catch (err: unknown) {
        let message = "QR/image generation failed";
        if (typeof err === "object" && err !== null && "message" in err && typeof (err as { message?: unknown }).message === "string") {
          message = (err as { message: string }).message;
        }
        return Response.json(
          {
            success: false,
            error: message,
          },
          { status: 500 },
        );
      }
      const filename = makeFilename(row, i + 1);
      files.push({ filename, buffer: imageBuffer });
    }

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
