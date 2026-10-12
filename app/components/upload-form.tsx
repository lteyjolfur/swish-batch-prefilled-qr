"use client";

import { useId, useState } from "react";
import LockMessageToggle from "./lock-message-toggle";
import PresetSelector from "./preset-selector";
import ResultSummary from "./result-summary";

// Helper to trigger a browser download of a Blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Safari can start the download after a.click() returns, and revoking the
  // URL first cancels it. Keep the blob alive a while, as FileSaver.js does.
  setTimeout(() => window.URL.revokeObjectURL(url), 40_000);
}

// Turns the API's error body into displayable strings. Row validation errors
// arrive as `errors: {row, message}[]`, other failures as a single `error`.
async function readErrors(res: Response): Promise<string[]> {
  try {
    const data: {
      errors?: { row: number; message: string }[];
      error?: string;
    } = await res.json();
    if (data.errors?.length) {
      return data.errors.map((e) => `Row ${e.row}: ${e.message}`);
    }
    if (data.error) return [data.error];
  } catch {
    // Non-JSON body; fall through to generic message
  }
  return [];
}

export type Preset = "plain" | "branded";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>("branded");
  const [lockMessage, setLockMessage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    errors?: string[];
    serverError?: string;
  }>({});
  const fileId = useId();
  const hintId = useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResult({});
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handlePresetChange = (value: Preset) => {
    setPreset(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult({});
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("preset", preset);
      formData.append("lockMessage", String(lockMessage));
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const blob = await res.blob();
        downloadBlob(blob, "swish-qr-codes.zip");
        setResult({ success: true });
        return;
      }
      const errors = await readErrors(res);
      if (res.status === 400) {
        setResult({ errors: errors.length ? errors : ["Validation failed."] });
        return;
      }
      if (res.status === 429) {
        setResult({
          serverError:
            errors[0] ?? "Too many requests. Please try again later.",
        });
        return;
      }
      setResult({
        serverError: errors.length
          ? `Server error: ${errors.join(" ")}`
          : "Server error. Please try again.",
      });
    } catch {
      setResult({ serverError: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
      <div className="space-y-2">
        <label htmlFor={fileId} className="block font-medium">
          CSV file
        </label>
        <input
          id={fileId}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={loading}
          aria-describedby={hintId}
          className="focus-ring block w-full min-w-0 rounded border border-border-field bg-field px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-field-button file:px-3 file:py-1 file:text-foreground"
          required
        />
        <p id={hintId} className="text-sm text-muted">
          Columns: payee and amount, plus optional message (max 50 characters),
          label and size.
        </p>
      </div>
      <PresetSelector
        value={preset}
        onChange={handlePresetChange}
        disabled={loading}
      />
      <LockMessageToggle
        value={lockMessage}
        onChange={setLockMessage}
        disabled={loading}
      />
      <button
        type="submit"
        className="focus-ring w-full rounded bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!file || loading}
      >
        {loading ? "Generating…" : "Generate ZIP"}
      </button>
      <ResultSummary result={result} />
    </form>
  );
}
