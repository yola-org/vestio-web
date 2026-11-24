import type { Category, SizeGroup } from "@/lib/api/schemas"

/** Parent-category searches include their subcategories, so include their sizes too. */
export function categorySizeGroups(
  category: Category | undefined,
  groups: SizeGroup[],
): SizeGroup[] {
  if (!category) return groups
  const selected = new Map<string, SizeGroup>()
  const categoryIds = new Set<string>()
  function visit(node: Category) {
    categoryIds.add(node.id)
    const group =
      node.sizeGroup ?? groups.find((item) => item.id === node.sizeGroupId)
    if (group) {
      const previous = selected.get(group.id)
      const sizes = new Map(
        (previous?.sizes ?? []).map((size) => [size.id, size]),
      )
      for (const size of group.sizes) sizes.set(size.id, size)
      selected.set(group.id, { ...group, sizes: [...sizes.values()] })
    }
    node.subCategories?.forEach(visit)
  }
  visit(category)
  for (const group of groups) {
    if (selected.has(group.id)) continue
    const sizes = group.sizes.filter(
      (size) => size.categoryId && categoryIds.has(size.categoryId),
    )
    if (sizes.length) selected.set(group.id, { ...group, sizes })
  }
  return [...selected.values()].filter((group) => group.sizes.length > 0)
}

/** Selling uses only the selected category's sizes, never its descendants'. */
export function listingSizeGroup(
  category: Category | undefined,
  groups: SizeGroup[],
) {
  return (
    category?.sizeGroup ??
    groups.find((group) => group.id === category?.sizeGroupId)
  )
}

/** Keep sizing systems distinct: EU numbers are not letter-size conversions. */
export function sizeSystemOptions(sizes: SizeGroup["sizes"]) {
  const systems =
    new Map<"international" | "eu" | "waist" | "other", SizeGroup["sizes"]>()
  for (const size of sizes) {
    const system = /^EU \d/.test(size.name)
      ? "eu"
      : /^W\d/.test(size.name)
        ? "waist"
        : /^(X{0,3}S|M|L|X{1,3}L|[4-6]XL)$/.test(size.name)
          ? "international"
          : "other"
    const items = systems.get(system) ?? []
    items.push(size)
    systems.set(system, items)
  }
  return [...systems].map(([system, sizes]) => ({ system, sizes }))
}
