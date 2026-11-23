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
