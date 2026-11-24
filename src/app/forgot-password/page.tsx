"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Field from "@/components/shared/forms/Field"
import Input from "@/components/shared/forms/Input"
import Button from "@/components/shared/Button"
import { authApi } from "@/lib/api"
import { useApiForm } from "@/hooks/use-api-form"
import { useNotifications } from "@/components/shared/NotificationProvider"

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  )
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [error, setError] = useState("")
  const t = useTranslations("auth.reset")
  const router = useRouter()
  const { notify } = useNotifications()
  const { formAction, pending } = useApiForm(
    (data) => {
      setError("")
      return authApi.forgotPassword(String(data.get("email") ?? ""))
    },
    {
      loading: false,
      errors: {
        ERR_EMAIL_NOT_FOUND: {
          message: t("emailNotFound"),
          action: (failure) => setError(failure.message),
        },
      },
      onSuccess: () => {
        notify.info(t("sent"))
        router.push("/reset-password?email=" + encodeURIComponent(email.trim()))
      },
    },
  )
  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="main-container py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-3 text-3xl font-black">{t("requestTitle")}</h1>
          <p className="mb-6 text-black/60">{t("requestDescription")}</p>
          <form action={formAction} className="space-y-5">
            <Field id="email" label={t("email")} error={error || undefined}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError("")
                }}
              />
            </Field>
            <Button
              type="submit"
              loading={pending}
              className="w-full rounded-full bg-deep-accent p-3 font-bold text-white"
            >
              {t("send")}
            </Button>
          </form>
          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-bold text-deep-accent hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
