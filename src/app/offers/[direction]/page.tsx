import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import OffersList from "@/components/offers/OffersList"

export default async function OffersDirectionPage({
  params,
}: {
  params: Promise<{ direction: string }>
}) {
  const { direction } = await params
  if (direction !== "sent" && direction !== "received") notFound()

  const t = await getTranslations("offers")

  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <Header />
      <main className="main-container w-full flex-1 py-10 sm:py-12">
        <h1 className="mb-6 font-display text-4xl font-black tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <nav
          aria-label={t("title")}
          className="mb-6 flex gap-2 border-b border-black/10"
        >
          {(["received", "sent"] as const).map((type) => (
            <Link
              key={type}
              href={`/offers/${type}`}
              aria-current={type === direction ? "page" : undefined}
              className="border-b-2 border-transparent px-3 pb-3 text-sm font-bold text-primary/65 hover:text-primary aria-[current=page]:border-deep-accent aria-[current=page]:text-deep-accent"
            >
              {t(type)}
            </Link>
          ))}
        </nav>
        <OffersList key={direction} direction={direction} />
      </main>
      <Footer />
    </div>
  )
}
