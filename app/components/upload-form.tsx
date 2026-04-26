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

import { useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (res.status === 400) {
        const data = await res.json();
        setResult({ errors: data.errors || ["Validation failed."] });
        return;
      }
      setResult({ serverError: "Server error. Please try again." });
    } catch (err) {
      setResult({ serverError: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block font-medium text-gray-900 dark:text-gray-100">
        CSV file
      </label>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={loading}
        className="block border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <PresetSelector
        value={preset}
        onChange={handlePresetChange}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-4 py-2 rounded disabled:opacity-60 w-full font-semibold"
        disabled={!file || loading}
      >
        {loading ? "Generating..." : "Generate ZIP"}
      </button>
      <ResultSummary result={result} />
    </form>
  );
}
