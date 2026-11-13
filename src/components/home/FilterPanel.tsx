"use client"

import { Fragment, type ReactNode } from "react"
import Form from "next/form"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { conditions, contactTypes } from "@/constants/data"
import { useApiQuery } from "@/hooks/use-api-query"
import { profileApi } from "@/lib/api"
import type { Category } from "@/lib/api/schemas"

const fieldClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-deep-accent"

interface FilterPanelProps {
  query?: string
  filters?: Record<string, string>
}

function categoryOptions(categories: Category[], parent = ""): ReactNode {
  return categories.map((category) => {
    const label = parent ? `${parent} / ${category.name}` : category.name
    return (
      <Fragment key={category.id}>
        <option value={category.id}>{label}</option>
        {category.subCategories &&
          categoryOptions(category.subCategories, label)}
      </Fragment>
    )
  })
}

export default function FilterPanel({
  query = "",
  filters = {},
}: FilterPanelProps) {
  const t = useTranslations()
  const { data, loading, error, refetch } = useApiQuery(
    profileApi.getStaticData,
    {
      loading: false,
    },
  )
  const resetParams = new URLSearchParams(query ? { query } : {})
  const resetHref = query ? `/search?${resetParams}` : "/search"

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <Form action="/search" className="space-y-5">
        {query && <input type="hidden" name="query" value={query} />}
        {filters.brandId && (
          <input type="hidden" name="brandId" value={filters.brandId} />
        )}
        {error && (
          <p role="status" className="text-sm">
            {t("search.filtersError")}{" "}
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-bold underline"
            >
              {t("favorites.retry")}
            </button>
          </p>
        )}
        <label className="block space-y-2 text-sm font-bold">
          <span>{t("filters.categories")}</span>
          <select
            key={String(Boolean(data))}
            name="categoryId"
            className={fieldClass}
            defaultValue={filters.categoryId}
          >
            <option value="">{t("search.all")}</option>
            {data
              ? categoryOptions(data.categories)
              : filters.categoryId && (
                  <option value={filters.categoryId}>
                    {t("common.loading")}
                  </option>
                )}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-bold">
          <span>{t("sell.cities")}</span>
          <select
            key={String(Boolean(data))}
            name="cityId"
            className={fieldClass}
            defaultValue={filters.cityId}
          >
            <option value="">{t("header.allCities")}</option>
            {data
              ? data.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))
              : filters.cityId && (
                  <option value={filters.cityId}>{t("common.loading")}</option>
                )}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-bold">
          <span>{t("filters.size")}</span>
          <select
            key={String(Boolean(data))}
            name="sizeId"
            className={fieldClass}
            defaultValue={filters.sizeId}
          >
            <option value="">{t("search.all")}</option>
            {data
              ? data.sizes.map((group) => (
                  <optgroup key={group.id} label={group.name}>
                    {group.sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              : filters.sizeId && (
                  <option value={filters.sizeId}>{t("common.loading")}</option>
                )}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-bold">
          <span>{t("filters.condition")}</span>
          <select
            name="condition"
            className={fieldClass}
            defaultValue={filters.condition}
          >
            <option value="">{t("search.all")}</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {t(`conditions.${condition}.short`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-bold">
          <span>{t("sell.contact")}</span>
          <select
            name="contactType"
            className={fieldClass}
            defaultValue={filters.contactType}
          >
            <option value="">{t("search.all")}</option>
            {contactTypes.map((type) => (
              <option key={type} value={type}>
                {t(`sell.contactTypes.${type}`)}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-bold">
            {t("filters.price", { currency: t("common.currency") })}
          </legend>
          <div className="flex gap-3">
            <input
              type="number"
              name="minPrice"
              min="0"
              step="any"
              defaultValue={filters.minPrice}
              aria-label={t("filters.min")}
              placeholder={t("filters.min")}
              className={fieldClass}
            />
            <input
              type="number"
              name="maxPrice"
              min="0"
              step="any"
              defaultValue={filters.maxPrice}
              aria-label={t("filters.max")}
              placeholder={t("filters.max")}
              className={fieldClass}
            />
          </div>
        </fieldset>
        {filters.gender && (
          <input type="hidden" name="gender" value={filters.gender} />
        )}
        {filters.color && (
          <input type="hidden" name="color" value={filters.color} />
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-deep-accent py-3 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {t("search.apply")}
        </button>
        {Object.keys(filters).length > 0 && (
          <Link
            href={resetHref}
            className="block text-center text-xs font-bold hover:underline"
          >
            {t("filters.reset")}
          </Link>
        )}
      </Form>
    </aside>
  )
}
