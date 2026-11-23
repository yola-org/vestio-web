"use client"

import { use } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SellForm from "@/components/listings/SellForm"
import SellFormSkeleton from "@/components/listings/SellFormSkeleton"
import { useApiQuery } from "@/hooks/use-api-query"
import { getListingAction } from "@/lib/actions/listings"
import { getProfileAction } from "@/lib/actions/profile"

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const t = useTranslations("listingDetail")
  const listing = useApiQuery(() => getListingAction(id), {
    deps: [id],
    loading: false,
  })
  const profile = useApiQuery(getProfileAction, { loading: false })
  const loading = listing.loading || profile.loading
  const ownsListing = Boolean(
    listing.data?.userId && listing.data.userId === profile.data?.id,
  )
  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <Header />
      <main className="main-container flex-1 pt-6 pb-10">
        <h1 className="mb-8 text-center text-3xl font-black">{t("edit")}</h1>
        {loading ? (
          <SellFormSkeleton />
        ) : ownsListing && listing.data ? (
          <SellForm key={listing.data.id} listing={listing.data} />
        ) : (
          <div role="alert" className="text-center">
            <p>{t("editUnavailable")}</p>
            <Link
              href={`/listings/${id}`}
              className="mt-4 inline-block font-bold text-deep-accent hover:underline"
            >
              {t("backToListing")}
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
