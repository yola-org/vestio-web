"use client"

import { useState, useEffect, useRef } from "react"
import { MessageIcon, ChevronIcon, PinIcon } from "@/components/shared/Icons"
import MessagesLink from "@/components/layout/MessagesLink"
import OffersLink from "@/components/layout/OffersLink"
import HeaderActions from "@/components/layout/HeaderActions"
import UserDropdown from "@/components/layout/UserDropdown"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { profileApi } from "@/lib/api"
import { useApiQuery } from "@/hooks/use-api-query"
import {
  isAuthenticated as hasAuthSession,
  readAccountDisplayName,
} from "@/lib/auth"
import type { AccountDisplayName } from "@/lib/api/schemas"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { categoryHref } from "@/lib/category-utils"
import HeaderSearch from "@/components/layout/HeaderSearch"
import {
  HeaderNavSkeleton,
  MegaMenuSkeleton,
} from "@/components/layout/HeaderSkeletons"

interface HeaderProps {
  searchQuery?: string
  searchCityIds?: string
  searchCategoryId?: string
  searchAction?: string
  searchFilters?: Record<string, string>
}

export default function Header({
  searchQuery = "",
  searchCityIds = "",
  searchCategoryId,
  searchAction,
  searchFilters = {},
}: HeaderProps) {
  const t = useTranslations()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [selectedCityId, setSelectedCityId] = useState(
    searchCityIds.split(",")[0] ?? "",
  )
  const [citySelectorOpen, setCitySelectorOpen] = useState(false)
  const citySelectorRef = useRef<HTMLDivElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [displayName, setDisplayName] = useState<AccountDisplayName>()
  const headerRef = useRef<HTMLElement>(null)

  const citiesQuery = useApiQuery(profileApi.getCities, {
    critical: true,
    loading: false,
  })
  const categoriesQuery = useApiQuery(profileApi.getCategories, {
    critical: true,
    loading: false,
  })

  const cities = citiesQuery.data ?? []
  const selectedCity = cities.find((city) => city.id === selectedCityId)
  const categories = categoriesQuery.data ?? []
  const loading = citiesQuery.loading || categoriesQuery.loading

  useEffect(() => {
    const updateAuthentication = () => {
      setIsAuthenticated(hasAuthSession())
      setDisplayName(readAccountDisplayName())
    }
    updateAuthentication()
    window.addEventListener("vestio:auth-changed", updateAuthentication)
    return () =>
      window.removeEventListener("vestio:auth-changed", updateAuthentication)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMobileOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        setMobileOpen(false)
        document.getElementById("header-mobile-toggle")?.focus()
      }
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", escape)
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        citySelectorRef.current &&
        !citySelectorRef.current.contains(event.target as Node)
      ) {
        setCitySelectorOpen(false)
      }
    }

    if (citySelectorOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [citySelectorOpen])

  const activeSearchFilters = selectedCityId
    ? { ...searchFilters, cityIds: selectedCityId }
    : searchFilters

  return (
    <header
      ref={headerRef}
      className="relative z-50 border-b border-primary/8 bg-background"
    >
      <div className="bg-deep-accent py-2 text-center text-[11px] font-bold tracking-[0.16em] text-white uppercase sm:text-xs content-padding">
        {t("header.banner")}
      </div>
      <div className="flex h-20 items-center gap-3 main-container lg:gap-5 xl:gap-7">
        <Link
          href="/"
          className="shrink-0 text-[26px] sm:text-[28px] font-black tracking-[-0.06em]"
          aria-label={t("header.homeAria")}
        >
          VESTIO<span className="text-accent">.</span>
        </Link>

        <div className="relative hidden min-w-0 flex-1 lg:block">
          <div className="flex min-w-0 items-center rounded-full border border-primary/10 bg-white transition focus-within:border-deep-accent focus-within:ring-2 focus-within:ring-deep-accent/10">
            <div
              className="relative border-e border-black/10"
              ref={mobileOpen ? undefined : citySelectorRef}
            >
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex h-12 items-center gap-2 px-5 text-sm font-bold whitespace-nowrap hover:bg-black/5 rounded-s-full transition"
              >
                <PinIcon className="h-4 w-4 text-accent" />
                {selectedCity?.name ?? t("header.allCities")}
                <ChevronIcon
                  className={`h-4 w-4 transition ${
                    citySelectorOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {citySelectorOpen && (
                <div className="absolute top-full start-0 mt-2 w-56 overflow-hidden bg-white shadow-2xl rounded-xl border border-black/10 z-50 py-2">
                  <div className="max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCityId("")
                        setCitySelectorOpen(false)
                      }}
                      className={`flex w-full items-center px-5 py-2.5 text-sm transition hover:bg-deep-accent/5 ${
                        !selectedCityId
                          ? "bg-deep-accent/10 font-bold text-deep-accent"
                          : "text-black/70"
                      }`}
                    >
                      {t("header.allCities")}
                    </button>
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCityId(city.id)
                          setCitySelectorOpen(false)
                        }}
                        className={`flex w-full items-center px-5 py-2.5 text-sm transition hover:bg-deep-accent/5 ${
                          selectedCityId === city.id
                            ? "bg-deep-accent/10 font-bold text-deep-accent"
                            : "text-black/70"
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <HeaderSearch
              initialQuery={searchQuery}
              filters={activeSearchFilters}
              categoryId={searchCategoryId}
              action={searchAction}
            />
          </div>
        </div>

        <HeaderActions
          authenticated={isAuthenticated}
          displayName={displayName}
          mobileOpen={mobileOpen}
          onMenuToggle={() => {
            setMobileOpen(!mobileOpen)
          }}
        />
      </div>

      <div className="border-t border-primary/8">
        <div className="main-container flex items-center gap-3 sm:gap-6">
          {loading ? (
            <HeaderNavSkeleton />
          ) : (
            <nav
              className="flex h-12 min-w-0 flex-1 items-center gap-5 overflow-x-auto text-[11px] font-bold tracking-[0.06em] whitespace-nowrap uppercase sm:gap-8 sm:text-xs"
              aria-label={t("header.categoriesAria")}
            >
              <div
                className="group h-full"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
                onFocus={() => setMegaOpen(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setMegaOpen(false)
                }}
              >
                <button
                  className="flex h-full items-center gap-1.5 text-deep-accent"
                  aria-expanded={megaOpen}
                >
                  {t("header.allCategories")}{" "}
                  <ChevronIcon
                    className={`h-4 w-4 transition ${
                      megaOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {megaOpen &&
                  (loading ? (
                    <MegaMenuSkeleton />
                  ) : (
                    <div className="absolute top-full end-0 start-0 border-t border-black/10 bg-background shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
                      <div className="mx-auto grid max-w-[1440px] grid-cols-6 gap-8 py-10 content-padding">
                        {categories.map((parent, index) => (
                          <div
                            key={parent.id}
                            className={
                              index < 5
                                ? "min-w-0 border-e border-black/10 pe-4"
                                : "min-w-0"
                            }
                          >
                            <Link
                              href={categoryHref(parent.name)}
                              title={parent.name}
                              onClick={() => setMegaOpen(false)}
                              className="mb-4 block truncate text-base font-black tracking-tight normal-case text-primary hover:text-deep-accent"
                            >
                              {parent.name}
                            </Link>
                            <ul className="space-y-2.5 text-[13px] font-medium tracking-normal normal-case text-black/60">
                              {parent.subCategories?.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={categoryHref(parent.name, child.name)}
                                    title={child.name}
                                    onClick={() => setMegaOpen(false)}
                                    className="block truncate hover:text-deep-accent hover:underline"
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              {categories.map((parent) => (
                <Link
                  key={parent.id}
                  href={categoryHref(parent.name)}
                  className="hover:text-deep-accent"
                >
                  {parent.name}
                </Link>
              ))}
            </nav>
          )}
          <LanguageSwitcher className="shrink-0 border-s border-primary/10 ps-3 sm:ps-5" />
        </div>
      </div>

      {mobileOpen && (
        <div
          id="header-mobile-menu"
          className="absolute top-full end-0 start-0 max-h-[calc(100dvh-11rem)] overflow-y-auto border-t border-primary/8 bg-white p-5 shadow-xl lg:hidden"
        >
          <div className="mb-5 flex flex-col gap-3">
            <div className="relative" ref={citySelectorRef}>
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-black/15 bg-white px-4 text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  <PinIcon className="h-4 w-4 text-accent" />
                  {selectedCity?.name ?? t("header.allCities")}
                </span>
                <ChevronIcon
                  className={`h-4 w-4 transition ${
                    citySelectorOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {citySelectorOpen && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-black/10 bg-white py-2 shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedCityId("")
                      setCitySelectorOpen(false)
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-deep-accent/5"
                  >
                    {t("header.allCities")}
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedCityId(city.id)
                        setCitySelectorOpen(false)
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-deep-accent/5"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <HeaderSearch
              initialQuery={searchQuery}
              filters={activeSearchFilters}
              categoryId={searchCategoryId}
              action={searchAction}
              mobile
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            {isAuthenticated ? (
              <>
                <OffersLink menu onNavigate={() => setMobileOpen(false)} />
                <MessagesLink menu onNavigate={() => setMobileOpen(false)} />
              </>
            ) : (
              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 flex items-center gap-3 rounded-2xl border border-primary/8 bg-background/50 px-4 py-4"
              >
                <MessageIcon className="size-5 text-primary/60" />
                {t("header.buy")}
              </Link>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-primary/8 pt-4">
            {isAuthenticated ? (
              <UserDropdown displayName={displayName} inline />
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-full border border-primary/15 px-4 py-3 text-center text-sm font-bold"
              >
                {t("header.login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
