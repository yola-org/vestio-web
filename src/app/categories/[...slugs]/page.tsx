import { notFound, redirect } from "next/navigation"
import ListingBrowsePage, {
  type ListingSearchParams,
} from "@/components/listings/ListingBrowsePage"
import { getCategoriesAction } from "@/lib/actions/profile"
import {
  categoryRedirectHref,
  findCategoryPath,
  findCategoryPathBySlug,
} from "@/lib/category-utils"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slugs: string[] }>
  searchParams: Promise<ListingSearchParams>
}) {
  const [{ slugs }, result] = await Promise.all([params, getCategoriesAction()])
  if (!result.success) throw new Error("Unable to load categories")

  const categoryPath = findCategoryPathBySlug(result.data, slugs)
  if (!categoryPath.length) {
    const legacyPath =
      slugs.length === 1 ? findCategoryPath(result.data, slugs[0]) : []
    if (legacyPath.length)
      redirect(categoryRedirectHref(legacyPath, await searchParams))
    notFound()
  }

  return (
    <ListingBrowsePage
      searchParams={searchParams}
      categoryPath={categoryPath}
    />
  )
}
