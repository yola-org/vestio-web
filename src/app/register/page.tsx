"use client"

import Link from "next/link"
import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ArrowIcon } from "@/components/shared/Icons"
import Input from "@/components/shared/forms/Input"
import PasswordInput from "@/components/shared/forms/PasswordInput"
import Field from "@/components/shared/forms/Field"
import Button from "@/components/shared/Button"
import { authApi } from "@/lib/api"
import { useApiForm } from "@/hooks/use-api-form"
import { useNotifications } from "@/components/shared/NotificationProvider"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [signupEmail, setSignupEmail] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupError, setSignupError] = useState("")
  const t = useTranslations()
  const router = useRouter()
  const { notify } = useNotifications()
  const { formAction, pending } = useApiForm(
    (formData) => {
      setSignupError("")
      const [firstName = "", ...lastName] = String(formData.get("name") ?? "")
        .trim()
        .split(/\s+/)

      return authApi.signup({
        firstName,
        lastName: lastName.join(" "),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      })
    },
    {
      loading: false,
      errors: {
        VALIDATION_ERROR: {
          message: t("auth.invalidFields"),
          action: (error) => setSignupError(error.message),
        },
        VALIDATION_FAILED: {
          message: t("auth.invalidFields"),
          action: (error) => setSignupError(error.message),
        },
        ERR_EMAIL_ALREADY_ASSOCIATED_WITH_ANOTHER_ACCOUNT: {
          message: t("auth.register.emailInUse"),
          action: (error) => setSignupError(error.message),
        },
      },
      onSuccess: () => {
        notify.success(t("auth.register.success"))
        router.push("/confirm-email?email=" + encodeURIComponent(signupEmail))
      },
    },
  )

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="pt-6 pb-20 main-container">
        <div className="mx-auto max-w-md bg-white p-8 shadow-sm rounded-2xl">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            {t("auth.register.title")}
          </h1>
          <p className="text-black/60 mb-8">{t("auth.register.subtitle")}</p>

          <form
            className="space-y-5"
            action={formAction}
            onChange={() => setSignupError("")}
            aria-describedby={signupError ? "signup-error" : undefined}
          >
            <Field id="name" label={t("auth.register.fullName")}>
              <Input
                type="text"
                id="name"
                name="name"
                value={signupName}
                onChange={(event) => setSignupName(event.target.value)}
                placeholder={t("auth.register.fullNamePlaceholder")}
              />
            </Field>
            <Field id="email" label={t("auth.register.email")}>
              <Input
                type="email"
                id="email"
                name="email"
                required
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                placeholder={t("auth.register.emailPlaceholder")}
              />
            </Field>
            <Field id="password" label={t("auth.register.password")}>
              <PasswordInput
                id="password"
                name="password"
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                autoComplete="new-password"
                placeholder={t("auth.register.passwordPlaceholder")}
              />
            </Field>
            {signupError && (
              <p
                id="signup-error"
                role="alert"
                className="text-sm font-medium text-red-700"
              >
                {signupError}
              </p>
            )}
            <Button
              type="submit"
              loading={pending}
              className="w-full bg-accent text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("auth.register.submit")} <ArrowIcon className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-black/10 text-center">
            <p className="text-sm text-black/60 mb-4">
              {t("auth.register.alreadyMember")}
            </p>
            <Link
              href="/login"
              className="inline-block text-deep-accent font-bold hover:underline"
            >
              {t("auth.register.loginLink")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
