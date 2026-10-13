export const en = {
  meta: {
    title: "Swish Batch QR Generator",
    description:
      "Generate Swish QR codes in bulk from a CSV file, with clean branded output ready for sharing or printing.",
  },
  header: {
    title: "Batch generate branded Swish QR codes",
    intro:
      "Generate Swish QR codes in bulk from a CSV file, with clean branded output ready for sharing or printing.",
    sampleCsv: "Download sample CSV",
  },
  form: {
    fileLabel: "CSV file",
    fileHint:
      "Columns: payee and amount, plus optional message (max {max} characters), label and size.",
    presetLegend: "Format",
    presetBranded: "Branded",
    presetPlain: "Plain",
    lockLabel: "Lock message",
    lockHint:
      "When ticked, payers can't change the message. Rows without a message always let the payer write one.",
    submit: "Generate ZIP",
    submitting: "Generating…",
  },
  result: {
    success: "ZIP generated and downloaded!",
    fixIntro: "Fix the following in your CSV and try again:",
    row: "Row {row}",
    rowWithLabel: "Row {row} ({label})",
    rowError: "{where}: {message}",
    validationFailed: "Validation failed.",
    serverError: "Server error: {detail}",
    serverErrorGeneric: "Server error. Please try again.",
    networkError: "Network error. Please try again.",
  },
  errors: {
    payeeRequired: "Payee is required",
    payeeInvalid: "Payee must be a Swish number (digits only)",
    amountRequired: "Amount is required",
    amountInvalid: "Amount must be a valid number",
    amountNotPositive: "Amount must be greater than 0",
    amountTooManyDecimals: "Amount can have at most 2 decimals",
    messageTooLong: "Message must be {max} characters or fewer",
    sizeOutOfRange: "Size must be a whole number between {min} and {max}",
    rateLimited:
      "Too many requests. Please wait {seconds} seconds and try again.",
    notMultipart: "Content-Type must be multipart/form-data",
    missingFile: "Missing file upload",
    fileTooLarge: "CSV file must be {maxMb} MB or smaller",
    invalidCsv: "Invalid CSV format",
    tooManyRows: "CSV can have at most {max} rows (got {count})",
    generationFailed: "Could not create the QR code ({detail})",
    zipFailed: "Could not build the ZIP file",
    internal: "Internal server error",
  },
  footer: {
    about: "Built to take the busywork out of collecting club fees with Swish.",
    source: "View source on GitHub",
    switchLabel: "Svenska",
    switchHref: "/sv",
    switchLang: "sv",
  },
};

export type Dictionary = typeof en;
