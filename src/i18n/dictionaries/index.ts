import { defaultLocale, type Locale } from "../config"
import ar from "./ar"
import fr from "./fr"

export type Dictionary = typeof fr

export const dictionaries: Record<Locale, Dictionary> = { fr, ar }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export type { Locale }
