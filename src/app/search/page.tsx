import { cookies } from "next/headers"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import FilterPanel from "@/components/home/FilterPanel"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SearchResults from "@/components/listings/SearchResults"
import { AUTH_INDICATOR_COOKIE } from "@/constants/auth"
import { searchListingsAction } from "@/lib/actions/listings"

const pageSize = 12
const searchKeys = [
  "query",
  "categoryId",
  "brandId",
  "cityId",
  "sizeId",
  "gender",
  "color",
  "condition",
  "contactType",
  "minPrice",
  "maxPrice",
]

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [input, t, cookieStore] = await Promise.all([
    searchParams,
    getTranslations(),
    cookies(),
  ])
  const params = new URLSearchParams()
  for (const key of searchKeys) {
    const value = input[key]
    if (typeof value === "string" && value.trim()) params.set(key, value.trim())
  }

  const rawPage = typeof input.page === "string" ? input.page : ""
  const page =
    /^\d+$/.test(rawPage) && Number(rawPage) <= 2147483647 ? Number(rawPage) : 0
  const { query = "", ...filters } = Object.fromEntries(params)
  const { cityId = "", ...headerFilters } = filters
  const minPrice = params.get("minPrice")
  const maxPrice = params.get("maxPrice")
  const invalidRange =
    minPrice !== null &&
    maxPrice !== null &&
    Number(minPrice) > Number(maxPrice)
  const result = invalidRange
    ? null
    : await searchListingsAction(Object.fromEntries(params), page, pageSize)
  const authenticated = cookieStore.get(AUTH_INDICATOR_COOKIE)?.value === "1"

  function pageHref(target: number) {
    const targetParams = new URLSearchParams(params)
    if (target > 0) targetParams.set("page", String(target))
    const search = targetParams.toString()
    return search ? `/search?${search}` : "/search"
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header
        key={JSON.stringify([query, cityId])}
        searchQuery={query}
        searchCityId={cityId}
        searchFilters={headerFilters}
      />
      <main id="shop" className="main-container py-12">
        <h1 className="mb-8 break-words text-4xl font-black tracking-tight">
          {query ? t("search.queryTitle", { query }) : t("search.title")}
        </h1>
        <div className="flex flex-col gap-10 lg:flex-row">
          <FilterPanel
            key={params.toString()}
            query={query}
            filters={filters}
          />
          <div className="min-w-0 flex-1">
            {result?.success ? (
              <SearchResults
                listings={result.data}
                authenticated={authenticated}
              />
            ) : (
              <p
                role="alert"
                className="rounded-xl border border-black/10 bg-white p-5"
              >
                {t(invalidRange ? "search.invalidPrice" : "search.loadError")}
              </p>
            )}
            {result?.success &&
              (page > 0 || result.data.length === pageSize) && (
                <nav className="mt-8 flex flex-wrap gap-3">
                  {page > 0 && (
                    <Link
                      href={pageHref(page - 1)}
                      className="rounded-full border border-black/15 px-5 py-2 text-sm font-bold"
                    >
                      {t("common.pagePrevious")}
                    </Link>
                  )}
                  {result.data.length === pageSize && page < 2147483647 && (
                    <Link
                      href={pageHref(page + 1)}
                      className="rounded-full border border-black/15 px-5 py-2 text-sm font-bold"
                    >
                      {t("common.pageNext")}
                    </Link>
                  )}
                </nav>
              )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
