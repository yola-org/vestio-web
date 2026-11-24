"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Field from "@/components/shared/forms/Field"
import Input from "@/components/shared/forms/Input"
import Button from "@/components/shared/Button"
import { useApiForm } from "@/hooks/use-api-form"
import { useNotifications } from "@/components/shared/NotificationProvider"
import {
  confirmEmailAction,
  resendConfirmationAction,
} from "@/lib/actions/auth"

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmationForm />
    </Suspense>
  )
}

function ConfirmationForm() {
  const searchParams = useSearchParams()
  const t = useTranslations("auth.confirm")
  const router = useRouter()
  const { notify } = useNotifications()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const confirm = useApiForm(
    (data) => confirmEmailAction(email, String(data.get("pin") ?? "")),
    {
      loading: false,
      errors: {
        ERR_INVALID_VERIFICATION_PIN: {
          message: t("invalid"),
          action: (error) => notify.error(error.message),
        },
      },
      onSuccess: () => {
        notify.success(t("success"))
        router.push("/login")
      },
    },
  )
  const resend = useApiForm(() => resendConfirmationAction(email), {
    loading: false,
    errors: {
      ERR_VERIFICATION_RATE_LIMITED: {
        message: t("rateLimited"),
        action: (error) => notify.error(error.message),
      },
    },
    onSuccess: () => notify.success(t("sent")),
  })
  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="main-container py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-black">{t("title")}</h1>
          <p className="mb-6 text-black/60">{t("description")}</p>
          <form action={confirm.formAction} className="space-y-5">
            <Field id="email" label={t("email")}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field id="pin" label={t("pin")}>
              <Input
                id="pin"
                name="pin"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
              />
            </Field>
            <Button
              type="submit"
              loading={confirm.pending}
              disabled={resend.pending}
              className="w-full rounded-full bg-accent p-3 text-white"
            >
              {t("submit")}
            </Button>
          </form>
          <form action={resend.formAction} className="mt-5">
            <Button
              type="submit"
              loading={resend.pending}
              disabled={!email || confirm.pending}
              className="w-full p-3"
            >
              {t("resend")}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
