import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import sharp from "sharp";
import { POST } from "./route";

let png: Buffer;

beforeAll(async () => {
  png = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "#000" },
  })
    .png()
    .toBuffer();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Stubs the Swish QR API. Returns the mock so tests can inspect calls.
function mockSwish(impl?: () => Promise<Response>) {
  const fetchMock = vi.fn<typeof fetch>(
    impl ?? (async () => new Response(new Uint8Array(png), { status: 200 })),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Each request gets its own IP so the shared rate limiter doesn't interfere
let ipCounter = 0;
const nextIp = () => `10.0.0.${++ipCounter}`;

function request(csv: string, preset = "plain", ip = nextIp()) {
  const form = new FormData();
  form.append("file", new File([csv], "payments.csv", { type: "text/csv" }));
  form.append("preset", preset);
  return new Request("http://localhost/api/generate", {
    method: "POST",
    body: form,
    headers: { "x-real-ip": ip },
  });
}

const header = "payee,amount,message,label\n";

describe("POST /api/generate", () => {
  it("returns a ZIP with one deduped image per row", async () => {
    const fetchMock = mockSwish();
    const res = await POST(
      request(
        header +
          "1231231234,100,Membership fee,Årsavgift\n" +
          "1231231234,150,Training fee,Årsavgift\n" +
          "1231231234,50,Kiosk,Youth Group\n",
      ),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/zip");
    const zip = await JSZip.loadAsync(await res.arrayBuffer());
    expect(Object.keys(zip.files)).toEqual([
      "arsavgift.png",
      "arsavgift-2.png",
      "youth-group.png",
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toMatchObject({
      payee: { value: "1231231234" },
      amount: { value: 100 },
      message: { value: "Membership fee" },
      size: 500,
    });
  });

  it("composes branded cards", async () => {
    mockSwish();
    const res = await POST(request(header + "123,100,Fee,Youth\n", "branded"));
    expect(res.status).toBe(200);
    const zip = await JSZip.loadAsync(await res.arrayBuffer());
    const image = await zip.file("youth.png")!.async("nodebuffer");
    const meta = await sharp(image).metadata();
    expect([meta.width, meta.height]).toEqual([520, 600]);
  });

  it("calls Swish at most 5 at a time", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    mockSwish(async () => {
      maxInFlight = Math.max(maxInFlight, ++inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return new Response(new Uint8Array(png), { status: 200 });
    });
    const rows = Array.from({ length: 12 }, (_, i) => `123,10,Fee ${i},\n`);
    const res = await POST(request(header + rows.join("")));
    expect(res.status).toBe(200);
    expect(maxInFlight).toBe(5);
  });

  it("returns row validation errors without calling Swish", async () => {
    const fetchMock = mockSwish();
    const res = await POST(request(header + "123,abc,Fee,\n,10,Fee,\n"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      errors: [
        { row: 1, message: "Amount must be a valid number" },
        { row: 2, message: "Payee is required" },
      ],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed CSV", async () => {
    mockSwish();
    const res = await POST(request(header + "123,100\n"));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Invalid CSV format" });
  });

  it("rejects more than 200 rows", async () => {
    const fetchMock = mockSwish();
    const rows = "123,10,Fee,\n".repeat(201);
    const res = await POST(request(header + rows));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: "CSV can have at most 200 rows (got 201)",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects files over 1 MB", async () => {
    mockSwish();
    const res = await POST(request(header + "x".repeat(1024 * 1024)));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: "CSV file must be 1 MB or smaller",
    });
  });

  it("rejects requests without multipart form data", async () => {
    const res = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: "{}",
        headers: { "content-type": "application/json", "x-real-ip": nextIp() },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 with the Swish error when the API fails", async () => {
    mockSwish(async () => new Response("bad payee", { status: 422 }));
    const res = await POST(request(header + "123,100,Fee,\n"));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      error: "Swish QR generation failed: HTTP 422 bad payee",
    });
  });

  it("returns 500 when Swish is unreachable", async () => {
    mockSwish(async () => {
      throw new Error("ECONNREFUSED");
    });
    const res = await POST(request(header + "123,100,Fee,\n"));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      error: "Swish QR generation failed: ECONNREFUSED",
    });
  });

  it("rate limits each IP to 10 requests per minute", async () => {
    const fetchMock = mockSwish();
    const ip = "203.0.113.7";
    const csv = header + "123,100,Fee,\n";
    for (let i = 0; i < 10; i++) {
      expect((await POST(request(csv, "plain", ip))).status).toBe(200);
    }

    const limited = await POST(request(csv, "plain", ip));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await limited.json()).toMatchObject({
      error: expect.stringContaining("Too many requests"),
    });
    expect(fetchMock).toHaveBeenCalledTimes(10);

    // Other clients are unaffected
    expect((await POST(request(csv))).status).toBe(200);
  });
});
