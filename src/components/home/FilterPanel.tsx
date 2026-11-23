"use client"

import { MaleIcon, FemaleIcon } from "@/components/shared/Icons"
import Checkbox from "@/components/shared/forms/Checkbox"
import CategorySelect from "./CategorySelect"
import MultiSelect from "@/components/shared/MultiSelect"
import PriceRangeFilter from "./PriceRangeFilter"
import FilterPanelSkeleton from "@/components/home/FilterPanelSkeleton"
import { useId, useState } from "react"
import Form from "next/form"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { conditions, contactTypes } from "@/constants/data"
import { useApiQuery } from "@/hooks/use-api-query"
import { profileApi } from "@/lib/api"
import { findCategoryPath, findCategoryPathBySlug } from "@/lib/category-utils"
import { categorySizeGroups } from "@/lib/category-sizes"

const colorOptions = [
  { value: "Black", swatch: "#171717", label: "black" },
  { value: "White", swatch: "#ffffff", label: "white" },
  { value: "Gray", swatch: "#808080", label: "gray" },
  { value: "Brown", swatch: "#78452c", label: "brown" },
  { value: "Beige", swatch: "#dcc5a3", label: "beige" },
  { value: "Red", swatch: "#c62828", label: "red" },
  { value: "Orange", swatch: "#ed7822", label: "orange" },
  { value: "Yellow", swatch: "#f2ce32", label: "yellow" },
  { value: "Green", swatch: "#358343", label: "green" },
  { value: "Neon Green", swatch: "#88e52c", label: "neonGreen" },
  { value: "Blue", swatch: "#3265c9", label: "blue" },
  { value: "Purple", swatch: "#8448a4", label: "purple" },
  { value: "Pink", swatch: "#e77ca6", label: "pink" },
] as const

interface FilterPanelProps {
  query?: string
  filters?: Record<string, string>
  action?: string
  showCategoryFilter?: boolean
  categoryId?: string
}

export default function FilterPanel({
  query = "",
  filters = {},
  action = "/search",
  showCategoryFilter = true,
  categoryId,
}: FilterPanelProps) {
  const t = useTranslations()
  const [genders, setGenders] = useState<string[]>(
    filters.gender === "MALE" || filters.gender === "FEMALE"
      ? [filters.gender]
      : [],
  )
  const [showAllColors, setShowAllColors] = useState(false)
  const colorsId = useId()
  const [selectedColors, setSelectedColors] = useState(() => [
    ...new Set(
      (filters.colors ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map(
          (value) =>
            colorOptions.find(
              (option) => option.value.toLowerCase() === value.toLowerCase(),
            )?.value ?? value,
        ),
    ),
  ])
  const [categoryPath, setCategoryPath] = useState("")
  const [sizeIds, setSizeIds] = useState(
    filters.sizeIds?.split(",").filter(Boolean) ?? [],
  )
  const [cityIds, setCityIds] = useState(
    filters.cityIds?.split(",").filter(Boolean) ?? [],
  )
  const [selectedConditions, setSelectedConditions] = useState(
    filters.conditions?.split(",").filter(Boolean) ?? [],
  )
  const [selectedContactTypes, setSelectedContactTypes] = useState(
    filters.contactTypes?.split(",").filter(Boolean) ?? [],
  )
  const { data, loading, error, refetch } = useApiQuery(
    profileApi.getStaticData,
    {
      loading: false,
    },
  )
  const resetParams = new URLSearchParams(query ? { query } : {})
  const resetHref = query ? `${action}?${resetParams}` : action
  const selectedCategory = categoryId
    ? findCategoryPath(data?.categories ?? [], categoryId).at(-1)
    : categoryPath
      ? findCategoryPathBySlug(
          data?.categories ?? [],
          categoryPath.split("/"),
        ).at(-1)
      : undefined
  const sizeGroups = categorySizeGroups(selectedCategory, data?.sizes ?? [])

  if (loading) return <FilterPanelSkeleton />

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <aside
      aria-label={t("filters.title")}
      className="w-full shrink-0 self-start lg:w-64"
    >
      <Form action={action}>
        {query && <input type="hidden" name="query" value={query} />}
        {filters.brandId && (
          <input type="hidden" name="brandId" value={filters.brandId} />
        )}
        {error && (
          <div role="status" className="py-4 text-sm text-red-700">
            {t("search.filtersError")}{" "}
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-bold underline"
            >
              {t("favorites.retry")}
            </button>
          </div>
        )}
        <fieldset className="min-w-0 border-b border-primary/8 pb-5 pt-0">
          <legend className="float-start mb-3 w-full text-sm font-bold">
            {t("filters.gender")}
          </legend>
          <input
            type="hidden"
            name="gender"
            value={genders.length === 1 ? genders[0] : ""}
          />
          <div className="grid clear-both grid-cols-2 gap-2">
            {(["MALE", "FEMALE"] as const).map((gender) => (
              <label key={gender} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={genders.includes(gender)}
                  onChange={(event) =>
                    setGenders(
                      event.target.checked
                        ? [...genders, gender]
                        : genders.filter((value) => value !== gender),
                    )
                  }
                  className="peer sr-only"
                />
                <span className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary/10 px-2 py-2 text-sm font-semibold text-primary/65 transition hover:border-primary/25 peer-checked:border-deep-accent peer-checked:bg-deep-accent/6 peer-checked:text-deep-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-deep-accent">
                  {gender === "MALE" ? (
                    <MaleIcon className="size-4" />
                  ) : (
                    <FemaleIcon className="size-4" />
                  )}
                  {t(gender === "MALE" ? "filters.male" : "filters.female")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="border-b border-primary/8 py-5">
          <MultiSelect
            name="cityIds"
            label={t("sell.cities")}
            options={(data?.cities ?? []).map((city) => ({
              value: city.id,
              label: city.name,
            }))}
            value={cityIds}
            onChange={setCityIds}
            disabled={!data}
            placeholder={t("header.allCities")}
          />
        </div>
        {showCategoryFilter && (
          <div className="border-b border-primary/8 py-5">
            <CategorySelect
              categories={data?.categories ?? []}
              disabled={!data}
              value={categoryPath}
              onChange={(path) => {
                const category = path
                  ? findCategoryPathBySlug(
                      data?.categories ?? [],
                      path.split("/"),
                    ).at(-1)
                  : undefined
                const available = categorySizeGroups(
                  category,
                  data?.sizes ?? [],
                )
                const availableIds = new Set(
                  available.flatMap((group) =>
                    group.sizes.map((size) => size.id),
                  ),
                )
                setSizeIds((selected) =>
                  selected.filter((id) => availableIds.has(id)),
                )
                setCategoryPath(path)
              }}
            />
          </div>
        )}
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
        />
        <div className="border-b border-primary/8 py-5">
          <MultiSelect
            name="sizeIds"
            label={t("filters.size")}
            options={sizeGroups.map((group) => ({
              label: group.name,
              options: group.sizes.map((size) => ({
                value: size.id,
                label: size.name,
              })),
            }))}
            value={
              data
                ? sizeIds.filter((id) =>
                    sizeGroups.some((group) =>
                      group.sizes.some((size) => size.id === id),
                    ),
                  )
                : sizeIds
            }
            onChange={setSizeIds}
            disabled={
              !data || (Boolean(selectedCategory) && sizeGroups.length === 0)
            }
            placeholder={
              selectedCategory && sizeGroups.length === 0
                ? t("sell.noSizes")
                : t("search.all")
            }
          />
        </div>
        <div className="border-b border-primary/8 py-5">
          <MultiSelect
            name="conditions"
            label={t("filters.condition")}
            options={conditions.map((condition) => ({
              value: condition,
              label: t(`conditions.${condition}.short`),
            }))}
            value={selectedConditions}
            onChange={setSelectedConditions}
          />
        </div>
        <fieldset className="min-w-0 border-b border-primary/8 py-5">
          <legend className="float-start mb-3 w-full text-sm font-bold">
            {t("filters.color")}
          </legend>
          <div id={colorsId} className="grid clear-both grid-cols-2 gap-2">
            {[
              ...(selectedColors.length > 0
                ? [{ value: "", label: t("search.all") }]
                : []),
              ...colorOptions
                .filter(
                  (option, index) =>
                    showAllColors ||
                    index < 5 ||
                    selectedColors.includes(option.value),
                )
                .map(({ value, swatch, label }) => ({
                  value,
                  swatch,
                  label: t(`filters.colors.${label}`),
                })),
              ...selectedColors
                .filter(
                  (value) =>
                    !colorOptions.some((option) => option.value === value),
                )
                .map((value) => ({ value, label: value })),
            ].map((option) => (
              <label key={option.value} className="min-w-0 cursor-pointer">
                <Checkbox
                  name={option.value ? "colors" : undefined}
                  value={option.value}
                  checked={selectedColors.includes(option.value)}
                  onChange={() =>
                    setSelectedColors((selected) =>
                      !option.value
                        ? []
                        : selected.includes(option.value)
                          ? selected.filter((color) => color !== option.value)
                          : [...selected, option.value],
                    )
                  }
                  className="peer sr-only"
                />
                <span className="flex min-h-10 items-center gap-2 rounded-xl border border-primary/10 px-2.5 py-2 text-xs font-medium text-primary/70 transition hover:border-primary/25 peer-checked:border-deep-accent peer-checked:bg-deep-accent/6 peer-checked:text-deep-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-deep-accent">
                  {"swatch" in option && (
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded-full border border-black/15 shadow-inner"
                      style={{ backgroundColor: option.swatch }}
                    />
                  )}
                  <span className="break-words">{option.label}</span>
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={showAllColors}
            aria-controls={colorsId}
            onClick={() => setShowAllColors(!showAllColors)}
            className="mt-3 text-xs font-semibold text-deep-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-accent"
          >
            {t(
              showAllColors
                ? "filters.showLessColors"
                : "filters.showAllColors",
            )}
          </button>
        </fieldset>
        <div className="border-b border-primary/8 py-5">
          <MultiSelect
            name="contactTypes"
            label={t("sell.contact")}
            options={contactTypes.map((type) => ({
              value: type,
              label: t(`sell.contactTypes.${type}`),
            }))}
            value={selectedContactTypes}
            onChange={setSelectedContactTypes}
          />
        </div>
        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-deep-accent px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-accent"
        >
          {t("search.apply")}
        </button>
        {activeCount > 0 && (
          <Link
            href={resetHref}
            className="mt-3 block text-center text-xs font-semibold text-primary/60 transition hover:text-primary hover:underline"
          >
            {t("filters.reset")}
          </Link>
        )}
      </Form>
    </aside>
  )
}
