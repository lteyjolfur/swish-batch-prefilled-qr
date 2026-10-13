import type { Dictionary } from "./en";

export const sv: Dictionary = {
  meta: {
    title: "Swish QR-koder i bulk",
    description:
      "Skapa Swish QR-koder i bulk från en CSV-fil, med snygga kort som är redo att dela eller skriva ut.",
  },
  header: {
    title: "Skapa Swish QR-koder i bulk",
    intro:
      "Skapa Swish QR-koder för många betalningar på en gång från en CSV-fil, med snygga kort som är redo att dela eller skriva ut.",
    sampleCsv: "Ladda ner exempel-CSV",
  },
  form: {
    fileLabel: "CSV-fil",
    fileHint:
      "Kolumner: payee och amount, samt valfria message (max {max} tecken), label och size.",
    presetLegend: "Format",
    presetBranded: "Branded",
    presetPlain: "Enkel",
    lockLabel: "Lås meddelandet",
    lockHint:
      "När rutan är ikryssad kan betalaren inte ändra meddelandet. Rader utan meddelande låter alltid betalaren skriva ett eget.",
    submit: "Skapa ZIP",
    submitting: "Skapar…",
  },
  result: {
    success: "ZIP-filen är skapad och nedladdad!",
    fixIntro: "Rätta följande i CSV-filen och försök igen:",
    row: "Rad {row}",
    rowWithLabel: "Rad {row} ({label})",
    rowError: "{where}: {message}",
    validationFailed: "Valideringen misslyckades.",
    serverError: "Serverfel: {detail}",
    serverErrorGeneric: "Serverfel. Försök igen.",
    networkError: "Nätverksfel. Försök igen.",
  },
  errors: {
    payeeRequired: "Mottagare (payee) saknas",
    payeeInvalid: "Mottagaren måste vara ett Swish-nummer (endast siffror)",
    amountRequired: "Belopp (amount) saknas",
    amountInvalid: "Beloppet måste vara ett giltigt tal",
    amountNotPositive: "Beloppet måste vara större än 0",
    amountTooManyDecimals: "Beloppet får ha högst 2 decimaler",
    messageTooLong: "Meddelandet får vara högst {max} tecken",
    sizeOutOfRange: "Storleken måste vara ett heltal mellan {min} och {max}",
    rateLimited:
      "För många förfrågningar. Vänta {seconds} sekunder och försök igen.",
    notMultipart: "Content-Type måste vara multipart/form-data",
    missingFile: "Ingen fil skickades",
    fileTooLarge: "CSV-filen får vara högst {maxMb} MB",
    invalidCsv: "Ogiltigt CSV-format",
    tooManyRows: "CSV-filen får ha högst {max} rader (hittade {count})",
    generationFailed: "Kunde inte skapa QR-koden ({detail})",
    zipFailed: "Kunde inte skapa ZIP-filen",
    internal: "Internt serverfel",
  },
  footer: {
    about:
      "Byggd för att slippa krånglet med att ta in klubbavgifter via Swish.",
    source: "Visa källkoden på GitHub",
    switchLabel: "English",
    switchHref: "/en",
    switchLang: "en",
  },
};
