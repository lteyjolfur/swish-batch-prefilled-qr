import Papa from "papaparse";
import type { CsvRow } from "./types";

/**
 * Parses CSV text into an array of CsvRow objects.
 * @param csvText The CSV file contents as a string
 * @returns Array of CsvRow objects (raw, unvalidated)
 */
export function parseCsv(csvText: string): CsvRow[] {
  const result = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors && result.errors.length > 0) {
    throw new Error("Invalid CSV format");
  }
  return result.data;
}
