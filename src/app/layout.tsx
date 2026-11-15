import type { Metadata } from "next"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import NotificationProvider from "@/components/shared/NotificationProvider"
import GlobalLoadingProvider from "@/components/shared/GlobalLoadingProvider"
import SessionBootstrap from "@/components/shared/SessionBootstrap"
import { AUTH_INDICATOR_COOKIE, AUTH_TOKEN_COOKIE } from "@/constants/auth"
import { localeDirection, type Locale } from "@/i18n/config"
import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = (await getLocale()) as Locale
  const cookieStore = await cookies()
  const needsRefresh =
    cookieStore.get(AUTH_INDICATOR_COOKIE)?.value === "1" &&
    !cookieStore.get(AUTH_TOKEN_COOKIE)?.value

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body>
        <NextIntlClientProvider>
          <GlobalLoadingProvider>
            <NotificationProvider>
              <SessionBootstrap needsRefresh={needsRefresh}>
                {children}
              </SessionBootstrap>
            </NotificationProvider>
          </GlobalLoadingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
