"use client"

import HomeHero from "./HomeHero"
import FilterPanel from "./FilterPanel"
import ProductGrid from "./ProductGrid"
import { useTranslations } from "next-intl"

export default function AuthenticatedHome() {
  const t = useTranslations()

  return (
    <div className="bg-[#f7f3ea]">
      <HomeHero />
      <div className="main-container py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <FilterPanel />
          <div className="flex-1">
            <ProductGrid
              title={t("home.authenticated.title")}
              subtitle={t("home.authenticated.subtitle")}
              limit={20}
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
