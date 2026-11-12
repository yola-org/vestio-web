"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ListingGrid from "@/components/shared/ListingGrid"
import { useFavorites } from "@/hooks/use-favorites"

export default function FavoritesPage() {
  const t = useTranslations()
  const favorites = useFavorites()

  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <Header />
      <main className="main-container w-full flex-1 py-12">
        <h1 className="mb-8 font-display text-4xl font-black tracking-tight sm:text-5xl">
          {t("favorites.title")}
        </h1>

        {favorites.error ? (
          <div
            className="rounded-[2rem] border border-black/10 bg-white p-8 text-center"
            role="status"
          >
            <p>{t("favorites.loadError")}</p>
            {favorites.error.status === 401 ? (
              <Link
                href="/login"
                className="mt-4 inline-block font-bold text-deep-accent hover:underline"
              >
                {t("header.login")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void favorites.refetch()}
                className="mt-4 font-bold text-deep-accent hover:underline"
              >
                {t("favorites.retry")}
              </button>
            )}
          </div>
        ) : (
          <>
            <ListingGrid
              listings={favorites.listings}
              isLoading={favorites.loading}
              emptyMessage={t("favorites.empty")}
              savedIds={favorites.savedIds}
              saveDisabled={favorites.saving}
              onToggleSave={favorites.toggle}
            />
            {!favorites.loading && favorites.listings.length === 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/#shop"
                  className="inline-block rounded-full bg-accent px-8 py-4 font-bold text-white transition hover:opacity-90"
                >
                  {t("favorites.browse")}
                </Link>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
