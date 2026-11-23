"use client"
// Placeholder — wire to a real endpoint or email service when ready
/* Hero */ /* Body */ /* Info */ /* Form */
import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

type Status = "idle" | "sending" | "sent" | "error"

export default function ContactPage() {
  const t = useTranslations("contact")
  const [status, setStatus] = useState<Status>("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    await new Promise((r) => setTimeout(r, 800))
    setStatus("sent")
  }

  return (
    <>
      {}
      <section className="main-container pb-10 pt-8">
        <p className="mb-3 text-xs font-black tracking-widest text-accent uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-primary/60">
          {t("subtitle")}
        </p>
      </section>

      {}
      <section className="main-container pb-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          {}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-lg font-black tracking-tight">
                {t("channels.email.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-primary/60">
                {t("channels.email.body")}
              </p>
              <a
                href="mailto:support@vestio.ma"
                className="mt-2 inline-block text-sm font-semibold text-deep-accent hover:underline"
              >
                support@vestio.ma
              </a>
            </div>

            <div>
              <h2 className="font-display text-lg font-black tracking-tight">
                {t("channels.faq.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-primary/60">
                {t("channels.faq.body")}
              </p>
              <Link
                href="/faq"
                className="mt-2 inline-block text-sm font-semibold text-deep-accent hover:underline"
              >
                {t("channels.faq.link")}
              </Link>
            </div>

            <div>
              <h2 className="font-display text-lg font-black tracking-tight">
                {t("channels.response.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-primary/60">
                {t("channels.response.body")}
              </p>
            </div>
          </div>

          {}
          <div>
            {status === "sent" ? (
              <div className="rounded-3xl border border-primary/10 bg-white p-10 text-center">
                <p className="font-display text-2xl font-black tracking-tight">
                  {t("form.successTitle")}
                </p>
                <p className="mt-3 text-sm leading-6 text-primary/60">
                  {t("form.successBody")}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-sm font-semibold text-deep-accent hover:underline"
                >
                  {t("form.another")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-3xl border border-primary/10 bg-white p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary/50">
                      {t("form.name")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary/50">
                      {t("form.email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary/50">
                    {t("form.subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary/50">
                    {t("form.message")}
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-primary/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600">{t("form.error")}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-accent py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {status === "sending" ? t("form.sending") : t("form.send")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
