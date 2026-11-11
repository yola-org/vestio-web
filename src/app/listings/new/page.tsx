"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SellForm from "@/components/listings/SellForm"
import { useTranslations } from "next-intl"

export default function NewListingPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />

      <main className="py-12 main-container">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight mb-3 sm:text-5xl">
            {t("sell.pageTitle")}
          </h1>
          <p className="text-black/50 font-medium">{t("sell.pageSubtitle")}</p>
        </div>

        <SellForm />
      </main>

      <Footer />
    </div>
  )
}
