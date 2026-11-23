import type { Category } from "@/lib/api/schemas"

export function categorySlug(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/\p{Mark}/gu, "")
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-|-$/g, "") || name.trim()
  )
}

export function categoryHref(...names: string[]) {
  return `/categories/${names.map((name) => encodeURIComponent(categorySlug(name))).join("/")}`
}

export function findCategoryPath(
  categories: Category[],
  id: string,
): Category[] {
  for (const category of categories) {
    if (category.id === id) return [category]
    const childPath = findCategoryPath(category.subCategories ?? [], id)
    if (childPath.length) return [category, ...childPath]
  }
  return []
}

export function findCategoryPathBySlug(
  categories: Category[],
  slugs: string[],
) {
  const path: Category[] = []
  let siblings = categories
  for (const slug of slugs) {
    const category = siblings.find((item) => categorySlug(item.name) === slug)
    if (!category) return []
    path.push(category)
    siblings = category.subCategories ?? []
  }
  return path
}

export function categoryRedirectHref(
  path: Category[],
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "category" || key === "categoryId") continue
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item?.trim()) params.append(key, item.trim())
    }
  }
  const href = categoryHref(...path.map((category) => category.name))
  return params.size ? `${href}?${params}` : href
}

/**
 * Converts a category and its subcategories into a formatted tree string.
 * @param category The root category to print.
 * @param indent The current indentation level.
 * @returns A string representation of the category hierarchy.
 */
export function categoryToString(
  category: Category,
  indent: number = 0,
): string {
  const spacing = "  ".repeat(indent)
  const sizeGroupId = category.sizeGroup?.id || category.sizeGroupId
  let result = `${spacing}- ${category.name} (ID: ${category.id}, sizeGroupId: ${sizeGroupId})\n`

  if (category.subCategories && category.subCategories.length > 0) {
    category.subCategories.forEach((child: any) => {
      result += categoryToString(child, indent + 1)
    })
  }

  return result
}

/**
 * Converts an array of categories into a formatted tree string.
 * @param categories The array of categories to print.
 * @returns A string representation of the entire category hierarchy.
 */
export function categoriesToString(categories: Category[]): string {
  return categories.map((cat) => categoryToString(cat)).join("\n")
}
