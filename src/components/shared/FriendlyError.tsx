"use client"

import { useTranslations } from "next-intl"

export default function FriendlyError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("errorPage")

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-primary">
      <div className="w-full max-w-xl space-y-7 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-base leading-7 text-primary/65">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-deep-accent px-6 py-3 font-bold text-white transition-colors hover:bg-deep-accent/90"
          >
            {t("retry")}
          </button>
          <a
            href="/"
            className="rounded-full border border-primary/25 px-6 py-3 font-bold transition-colors hover:bg-primary/5"
          >
            {t("home")}
          </a>
        </div>
      </div>
    </main>
  )
}
