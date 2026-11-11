import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import NotificationProvider from "@/components/shared/NotificationProvider"
import GlobalLoadingProvider from "@/components/shared/GlobalLoadingProvider"
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

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body>
        <NextIntlClientProvider>
          <GlobalLoadingProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </GlobalLoadingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
