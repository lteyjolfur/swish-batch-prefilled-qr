export const runtime = "nodejs";

import { parseCsv } from "../../../lib/csv/parse";
import { validateRows } from "../../../lib/csv/validate";

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
    } catch (err) {
      return Response.json(
        { success: false, error: "Invalid CSV format" },
        { status: 400 },
      );
    }

    const { valid, errors } = validateRows(rows);
    if (errors.length > 0) {
      return Response.json({ success: false, errors }, { status: 400 });
    }

    return Response.json({ success: true, count: valid.length });
  } catch (err) {
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
