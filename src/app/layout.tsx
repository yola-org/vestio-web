import type { Metadata } from "next"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import NotificationProvider from "@/components/shared/NotificationProvider"
import GlobalLoadingProvider from "@/components/shared/GlobalLoadingProvider"
import SessionBootstrap from "@/components/shared/SessionBootstrap"
import RealtimeProvider from "@/components/shared/RealtimeProvider"
import ChatPanelProvider from "@/components/chats/ChatPanelProvider"
import ChatDrawer from "@/components/chats/ChatDrawer"
import OffersPanelProvider from "@/components/offers/OffersPanelProvider"
import OffersDrawer from "@/components/offers/OffersDrawer"
import NotificationsPanelProvider from "@/components/notifications/NotificationsPanelProvider"
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer"
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
            <ChatPanelProvider>
              <OffersPanelProvider>
                <NotificationsPanelProvider>
                  <NotificationProvider>
                    <SessionBootstrap needsRefresh={needsRefresh}>
                      <RealtimeProvider>
                        {children}
                        <ChatDrawer />
                        <OffersDrawer />
                        <NotificationsDrawer />
                      </RealtimeProvider>
                    </SessionBootstrap>
                  </NotificationProvider>
                </NotificationsPanelProvider>
              </OffersPanelProvider>
            </ChatPanelProvider>
          </GlobalLoadingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
