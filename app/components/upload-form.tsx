"use client";

import { useId, useState } from "react";
import LockMessageToggle from "./lock-message-toggle";
import PresetSelector from "./preset-selector";
import ResultSummary from "./result-summary";
import type { Dictionary } from "../../lib/i18n/dictionaries/en";
import { format } from "../../lib/i18n/format";
import { MAX_MESSAGE_LENGTH } from "../../lib/csv/validate";

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

type FormStrings = {
  form: Dictionary["form"];
  result: Dictionary["result"];
  errors: Dictionary["errors"];
};

type ApiError = {
  code: string;
  params?: Record<string, string | number>;
};

// Translates an API error code; unknown codes are shown as they are.
function describeError(
  { code, params }: ApiError,
  errors: Dictionary["errors"],
): string {
  const template = (errors as Record<string, string>)[code];
  return template ? format(template, params) : code;
}

// Turns the API's error body into displayable strings. Row validation errors
// arrive as `errors: {row, code, params}[]`, other failures as a single
// `error: {code, params}`.
async function readErrors(
  res: Response,
  { result, errors }: FormStrings,
): Promise<string[]> {
  try {
    const data: {
      errors?: (ApiError & { row: number })[];
      error?: ApiError;
    } = await res.json();
    if (data.errors?.length) {
      return data.errors.map((e) =>
        format(result.rowError, {
          where: format(result.row, { row: e.row }),
          message: describeError(e, errors),
        }),
      );
    }
    if (data.error) {
      const { params } = data.error;
      if (data.error.code === "generationFailed" && params) {
        const where = format(
          params.label ? result.rowWithLabel : result.row,
          params,
        );
        return [
          format(result.rowError, {
            where,
            message: describeError(data.error, errors),
          }),
        ];
      }
      return [describeError(data.error, errors)];
    }
  } catch {
    // Non-JSON body; fall through to generic message
  }
  return [];
}

export type Preset = "plain" | "branded";

export default function UploadForm({ t }: { t: FormStrings }) {
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
      const errors = await readErrors(res, t);
      if (res.status === 400) {
        setResult({
          errors: errors.length ? errors : [t.result.validationFailed],
        });
        return;
      }
      if (res.status === 429) {
        setResult({
          serverError: errors[0] ?? t.result.serverErrorGeneric,
        });
        return;
      }
      setResult({
        serverError: errors.length
          ? format(t.result.serverError, { detail: errors.join(" ") })
          : t.result.serverErrorGeneric,
      });
    } catch {
      setResult({ serverError: t.result.networkError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
      <div className="space-y-2">
        <label htmlFor={fileId} className="block font-medium">
          {t.form.fileLabel}
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
          {format(t.form.fileHint, { max: MAX_MESSAGE_LENGTH })}
        </p>
      </div>
      <PresetSelector
        value={preset}
        onChange={handlePresetChange}
        disabled={loading}
        legend={t.form.presetLegend}
        labels={{
          branded: t.form.presetBranded,
          plain: t.form.presetPlain,
        }}
      />
      <LockMessageToggle
        value={lockMessage}
        onChange={setLockMessage}
        disabled={loading}
        label={t.form.lockLabel}
        hint={t.form.lockHint}
      />
      <button
        type="submit"
        className="focus-ring w-full rounded bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!file || loading}
      >
        {loading ? t.form.submitting : t.form.submit}
      </button>
      <ResultSummary
        result={result}
        successText={t.result.success}
        fixIntro={t.result.fixIntro}
      />
    </form>
  );
}
