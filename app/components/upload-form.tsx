"use client";
// Helper to trigger a browser download of a Blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
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

import { useId, useState } from "react";
import PresetSelector from "./preset-selector";
import ResultSummary from "./result-summary";

export type Preset = "plain" | "branded";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>("branded");
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
        <label
          htmlFor={fileId}
          className="block font-medium text-gray-900 dark:text-gray-100"
        >
          CSV file
        </label>
        <input
          id={fileId}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={loading}
          aria-describedby={hintId}
          className="block w-full min-w-0 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:px-3 file:py-1 file:text-gray-900 dark:file:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          required
        />
        <p id={hintId} className="text-sm text-gray-600 dark:text-gray-400">
          Columns: payee, amount, message (max 50 characters), and optional
          label and size.
        </p>
      </div>
      <PresetSelector
        value={preset}
        onChange={handlePresetChange}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-800 dark:bg-blue-500 text-white dark:text-gray-900 px-4 py-3 rounded disabled:opacity-60 disabled:cursor-not-allowed w-full font-semibold hover:bg-blue-900 dark:hover:bg-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
        disabled={!file || loading}
      >
        {loading ? "Generating…" : "Generate ZIP"}
      </button>
      <ResultSummary result={result} />
    </form>
  );
}
