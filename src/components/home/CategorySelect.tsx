"use client"

import { useTranslations } from "next-intl"
import SelectInput, {
  type SelectOption,
} from "@/components/shared/forms/SelectInput"
import type { Category } from "@/lib/api/schemas"
import { categorySlug } from "@/lib/category-utils"

function categoryOptions(
  categories: Category[],
  names: string[] = [],
): SelectOption[] {
  return categories.flatMap((category) => {
    const path = [...names, category.name]
    return [
      { value: path.map(categorySlug).join("/"), label: path.join(" / ") },
      ...categoryOptions(category.subCategories ?? [], path),
    ]
  })
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  disabled = false,
}: {
  categories: Category[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const t = useTranslations()
  const groups = categories.map((category) => ({
    label: category.name,
    options: categoryOptions([category]),
  }))
  return (
    <div data-category-select>
      <SelectInput
        name="category"
        label={t("filters.categories")}
        options={groups}
        value={value}
        onChange={onChange}
        disabled={disabled}
        classNamePrefix="category-select"
      />
    </div>
  )
}
