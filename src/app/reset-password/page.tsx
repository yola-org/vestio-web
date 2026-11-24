"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Field from "@/components/shared/forms/Field"
import Input from "@/components/shared/forms/Input"
import PasswordInput from "@/components/shared/forms/PasswordInput"
import Button from "@/components/shared/Button"
import { authApi } from "@/lib/api"
import { clearAuthTracking, notifyAuthChanged } from "@/lib/auth"
import { useApiForm } from "@/hooks/use-api-form"
import { useNotifications } from "@/components/shared/NotificationProvider"

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState("")
  const t = useTranslations("auth.reset")
  const router = useRouter()
  const { notify } = useNotifications()
  const mismatch = Boolean(confirmation && password !== confirmation)
  const reset = useApiForm(
    (data) =>
      authApi.resetPassword({
        email,
        pin: String(data.get("pin") ?? ""),
        newPassword: String(data.get("newPassword") ?? ""),
        confirmPassword: String(data.get("confirmPassword") ?? ""),
      }),
    {
      loading: false,
      errors: {
        ERR_EMAIL_NOT_FOUND: {
          message: t("emailNotFound"),
          action: (failure) => setError(failure.message),
        },
        ERR_INVALID_RESET_PIN: {
          message: t("invalid"),
          action: (failure) => setError(failure.message),
        },
        ERR_PASSWORD_POLICY: {
          message: t("policyError"),
          action: (failure) => setError(failure.message),
        },
        VALIDATION_ERROR: {
          message: t("requirements"),
          action: (failure) => setError(failure.message),
        },
        VALIDATION_FAILED: {
          message: t("requirements"),
          action: (failure) => setError(failure.message),
        },
      },
      onSuccess: () => {
        clearAuthTracking()
        notifyAuthChanged()
        notify.success(t("success"))
        router.push("/login")
        router.refresh()
      },
    },
  )
  const resend = useApiForm(() => authApi.forgotPassword(email), {
    loading: false,
    errors: {
      ERR_EMAIL_NOT_FOUND: {
        message: t("emailNotFound"),
        action: (failure) => setError(failure.message),
      },
    },
    onSuccess: () => {
      setError("")
      notify.info(t("sent"))
    },
  })
  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="main-container py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-3 text-3xl font-black">{t("title")}</h1>
          <p className="mb-6 text-black/60">{t("description")}</p>
          <form
            action={reset.formAction}
            className="space-y-5"
            onChange={() => setError("")}
          >
            <Field id="email" label={t("email")}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field id="pin" label={t("pin")}>
              <Input
                id="pin"
                name="pin"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "reset-error" : undefined}
              />
            </Field>
            <Field
              id="newPassword"
              label={t("newPassword")}
              description={t("requirements")}
            >
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={256}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <Field
              id="confirmPassword"
              label={t("confirmPassword")}
              error={mismatch ? t("mismatch") : undefined}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={256}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </Field>
            {error && (
              <p
                id="reset-error"
                role="alert"
                className="text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              loading={reset.pending}
              disabled={resend.pending || mismatch}
              className="w-full rounded-full bg-deep-accent p-3 font-bold text-white"
            >
              {t("submit")}
            </Button>
          </form>
          <form action={resend.formAction} className="mt-4">
            <Button
              type="submit"
              loading={resend.pending}
              disabled={!email || reset.pending}
              className="w-full p-3 font-bold text-deep-accent"
            >
              {t("resend")}
            </Button>
          </form>
          <Link
            href="/login"
            className="mt-4 block text-center text-sm font-bold text-deep-accent hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
