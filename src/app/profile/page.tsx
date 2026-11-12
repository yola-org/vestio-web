"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import PendingListings from "@/components/listings/PendingListings"
import ProfileAvatar from "@/components/shared/ProfileAvatar"
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"
import { profileApi, listingsApi } from "@/lib/api"
import { useApiQuery } from "@/hooks/use-api-query"
import ListingGrid from "@/components/shared/ListingGrid"
import { SettingsIcon, CameraIcon, HeartIcon } from "@/components/shared/Icons"
import { useTranslations } from "next-intl"
import Link from "next/link"

const listingTabs = ["articles", "pending"] as const
const listingColumns =
  "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"

export default function ProfilePage() {
  const t = useTranslations()
  const [activeTab, setActiveTab] =
    useState<typeof listingTabs[number]>("articles")
  const profileQuery = useApiQuery(profileApi.get, { loading: false })
  const listingsQuery = useApiQuery(() => listingsApi.list(0, 50), {
    loading: false,
  })

  const profile = profileQuery.data
  const listings = listingsQuery.data?.content ?? []
  const isLoading = profileQuery.loading || listingsQuery.loading

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f7f3ea]">
        <Header />
        <main className="main-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("profile.notFound")}</h1>
          <Link
            href="/login"
            className="text-[#173fdb] font-bold hover:underline"
          >
            {t("profile.pleaseLogin")}
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />

      <main className="py-12 main-container">
        {}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-[#f7f3ea]">
                <ProfileAvatar
                  firstName={profile.firstName}
                  lastName={profile.lastName}
                  size="xl"
                  alt={t("profile.avatarAlt", {
                    name: `${profile.firstName} ${profile.lastName}`,
                  })}
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-black/5 hover:bg-[#f7f3ea] transition">
                <CameraIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-black tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-bold hover:bg-black/5 transition"
                >
                  <SettingsIcon className="h-4 w-4" />{" "}
                  {t("profile.editProfile")}
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-bold hover:bg-black/5 transition"
                >
                  <HeartIcon className="h-4 w-4" aria-hidden="true" />
                  {t("header.favorites")}
                </Link>
              </div>
              <p className="text-black/60 font-medium mb-4 max-w-2xl">
                {profile.bio || t("profile.noBio")}
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold">{listings.length}</span>{" "}
                  <span className="text-black/50">
                    {t("profile.statsListings")}
                  </span>
                </div>
                <div>
                  <span className="font-bold">0</span>{" "}
                  <span className="text-black/50">
                    {t("profile.statsFollowers")}
                  </span>
                </div>
                <div>
                  <span className="font-bold">0</span>{" "}
                  <span className="text-black/50">
                    {t("profile.statsFollowing")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 border-b border-black/10">
          <div className="flex flex-wrap gap-x-4 sm:gap-x-8">
            <div
              className="flex gap-x-4 sm:gap-x-8"
              role="tablist"
              aria-label={t("profile.statsListings")}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return

                event.preventDefault()
                const nextTab =
                  event.key === "Home"
                    ? "articles"
                    : event.key === "End" || activeTab === "articles"
                      ? "pending"
                      : "articles"
                setActiveTab(nextTab)
                event.currentTarget
                  .querySelector<HTMLButtonElement>(`#profile-${nextTab}-tab`)
                  ?.focus()
              }}
            >
              {listingTabs.map((tab) => (
                <button
                  key={tab}
                  id={`profile-${tab}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`profile-${tab}-panel`}
                  tabIndex={activeTab === tab ? 0 : -1}
                  onClick={() => setActiveTab(tab)}
                  className="border-b-2 border-transparent pb-4 text-sm font-bold text-black/40 transition hover:text-black aria-selected:border-deep-accent aria-selected:text-deep-accent"
                >
                  {tab === "articles"
                    ? t("profile.tabListings", { count: listings.length })
                    : t("pendingListings.title")}
                </button>
              ))}
            </div>
            <button className="pb-4 text-sm font-bold text-black/40 hover:text-black transition">
              {t("profile.tabReviews", { count: 0 })}
            </button>
            <button className="pb-4 text-sm font-bold text-black/40 hover:text-black transition">
              {t("profile.tabAbout")}
            </button>
          </div>
        </div>

        <div
          id="profile-articles-panel"
          role="tabpanel"
          aria-labelledby="profile-articles-tab"
          tabIndex={0}
          hidden={activeTab !== "articles"}
        >
          <ListingGrid
            listings={listings}
            columns={listingColumns}
            emptyMessage={t("profile.emptyListings")}
          />
          {listings.length === 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/listings/new"
                className="inline-block bg-[#ff5d39] text-white px-8 py-4 rounded-full font-bold hover:bg-[#e94422] transition"
              >
                {t("profile.sellFirst")}
              </Link>
            </div>
          )}
        </div>
        <div
          id="profile-pending-panel"
          role="tabpanel"
          aria-labelledby="profile-pending-tab"
          tabIndex={0}
          hidden={activeTab !== "pending"}
        >
          {activeTab === "pending" && (
            <PendingListings columns={listingColumns} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
