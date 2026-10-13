import type { Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { sv } from "./dictionaries/sv";

const dictionaries: Record<Locale, Dictionary> = { en, sv };

export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale];
