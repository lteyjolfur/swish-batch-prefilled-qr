import type { Dictionary } from "../i18n/dictionaries/en";

// Language-neutral error codes; the client translates them via `errors.*`.
export type ErrorCode = keyof Dictionary["errors"];

export type ErrorParams = Record<string, string | number>;

export class CodedError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly params?: ErrorParams,
  ) {
    super(code);
    this.name = "CodedError";
  }
}
