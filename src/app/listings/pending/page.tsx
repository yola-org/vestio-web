import { getTranslations } from "next-intl/server"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import PendingListings from "@/components/listings/PendingListings"

export default async function PendingListingsPage() {
  const t = await getTranslations()

  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <Header />
      <main className="main-container w-full flex-1 py-12">
        <h1 className="mb-8 font-display text-4xl font-black tracking-tight sm:text-5xl">
          {t("pendingListings.title")}
        </h1>
        <PendingListings />
      </main>
      <Footer />
    </div>
  )
}
