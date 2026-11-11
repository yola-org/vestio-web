export const locales = ["fr", "ar"] as const

export type Locale = typeof locales[number]

export const defaultLocale: Locale = "fr"

/** Cookie used to persist the visitor's language across requests. */
export const LOCALE_COOKIE = "vestio_locale"

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value) && locales.includes(value as Locale)
}

export function localeDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr"
}

export const localeNames: Record<Locale, {
  label: string
  short: string
  native: string
}> = {
  fr: { label: "Français", short: "FR", native: "Français" },
  ar: { label: "Arabe", short: "AR", native: "العربية" },
}
