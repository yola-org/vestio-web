const DAY_MS = 24 * 60 * 60 * 1000

function localDay(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)
  return Date.UTC(value("year"), value("month") - 1, value("day")) / DAY_MS
}

/** Compare calendar days in the browser timezone, including 23/25-hour DST days. */
export function chatTimeParts(
  dateTime: string,
  now: number | null,
  locale: string,
  timeZone: string,
) {
  const date = new Date(dateTime)
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    calendar: "gregory",
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(date)
  const day = parts.find((part) => part.type === "day")!.value
  const month = parts.find((part) => part.type === "month")!.value
  return {
    daysAgo:
      now === null
        ? null
        : localDay(new Date(now), timeZone) - localDay(date, timeZone),
    date: `${day}/${month}`,
    time: new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date),
    title: new Intl.DateTimeFormat(locale, {
      timeZone,
      dateStyle: "full",
      timeStyle: "short",
    }).format(date),
  }
}
