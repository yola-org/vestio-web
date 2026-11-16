import { Suspense } from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import FilterPanel from "@/components/home/FilterPanel"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SearchResults from "@/components/listings/SearchResults"
import {
  ListingGridSkeleton,
  searchGridColumns,
} from "@/components/shared/ListingSkeletons"
import { AUTH_INDICATOR_COOKIE } from "@/constants/auth"
import { searchListingsAction } from "@/lib/actions/listings"
import type { Category } from "@/lib/api/schemas"
import { categoryHref } from "@/lib/category-utils"

const pageSize = 12
const searchKeys = [
  "query",
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

export type ListingSearchParams = Record<string, string | string[] | undefined>

export default async function ListingBrowsePage({
  searchParams,
  categoryPath = [],
}: {
  searchParams: Promise<ListingSearchParams>
  categoryPath?: Category[]
}) {
  const [input, t, cookieStore] = await Promise.all([
    searchParams,
    getTranslations(),
    cookies(),
  ])
  const category = categoryPath.at(-1)
  const categoryNames = categoryPath.map(({ name }) => name)
  const path = category ? categoryHref(...categoryNames) : "/search"
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
  const authenticated = cookieStore.get(AUTH_INDICATOR_COOKIE)?.value === "1"

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header
        key={JSON.stringify([query, cityId])}
        searchQuery={query}
        searchCityId={cityId}
        searchFilters={headerFilters}
        searchCategoryId={category?.id}
        searchAction={path}
      />
      <main id="shop" className="main-container py-12">
        {category && (
          <nav
            aria-label={t("listingDetail.categoryBreadcrumb")}
            className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold"
          >
            <Link href="/search" className="hover:underline">
              {t("search.title")}
            </Link>
            {categoryPath.slice(0, -1).map((parent, index) => (
              <span key={parent.id} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                <Link
                  href={categoryHref(...categoryNames.slice(0, index + 1))}
                  className="hover:underline"
                >
                  {parent.name}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <h1 className="mb-4 break-words text-4xl font-black tracking-tight">
          {category?.name ??
            (query ? t("search.queryTitle", { query }) : t("search.title"))}
        </h1>
        {category?.description && (
          <p className="mb-4">{category.description}</p>
        )}
        {Boolean(category?.subCategories?.length) && (
          <nav
            aria-label={t("header.categoriesAria")}
            className="mb-6 flex flex-wrap gap-2"
          >
            {category?.subCategories?.map((child) => (
              <Link
                key={child.id}
                href={categoryHref(...categoryNames, child.name)}
                className="rounded-full border border-black/15 px-4 py-2 text-sm font-bold hover:border-deep-accent hover:text-deep-accent"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        )}
        <div className="mt-8 flex flex-col gap-10 lg:flex-row">
          <FilterPanel
            key={params.toString()}
            query={query}
            filters={filters}
            action={path}
            showCategoryFilter={!category}
          />
          <div className="min-w-0 flex-1">
            {invalidRange ? (
              <p
                role="alert"
                className="rounded-xl border border-black/10 bg-white p-5"
              >
                {t("search.invalidPrice")}
              </p>
            ) : (
              <Suspense
                key={`${params}:${page}`}
                fallback={<ListingGridSkeleton columns={searchGridColumns} />}
              >
                <SearchPageResults
                  filters={params.toString()}
                  path={path}
                  categoryId={category?.id}
                  page={page}
                  authenticated={authenticated}
                />
              </Suspense>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

async function SearchPageResults({
  filters,
  path,
  categoryId,
  page,
  authenticated,
}: {
  filters: string
  path: string
  categoryId?: string
  page: number
  authenticated: boolean
}) {
  const params = new URLSearchParams(filters)
  const [result, t] = await Promise.all([
    searchListingsAction(
      {
        ...Object.fromEntries(params),
        ...(categoryId && { categoryId, includeSubcategories: "true" }),
      },
      page,
      pageSize,
    ),
    getTranslations(),
  ])

  if (!result.success) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-black/10 bg-white p-5"
      >
        {t("search.loadError")}
      </p>
    )
  }

  function pageHref(target: number) {
    const targetParams = new URLSearchParams(params)
    if (target > 0) targetParams.set("page", String(target))
    const search = targetParams.toString()
    return search ? `${path}?${search}` : path
  }

  return (
    <>
      <SearchResults listings={result.data} authenticated={authenticated} />
      {(page > 0 || result.data.length === pageSize) && (
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
    </>
  )
}
