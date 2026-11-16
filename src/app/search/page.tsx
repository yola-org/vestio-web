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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>
}) {
  const input = await searchParams
  const category = typeof input.category === "string" && input.category.trim()
  const categoryId =
    typeof input.categoryId === "string" && input.categoryId.trim()
  if (category || categoryId) {
    const result = await getCategoriesAction()
    if (!result.success) throw new Error("Unable to load categories")

    const path = category
      ? findCategoryPathBySlug(result.data, category.split("/"))
      : findCategoryPath(result.data, categoryId || "")
    if (!path.length) notFound()
    redirect(categoryRedirectHref(path, input))
  }

  return <ListingBrowsePage searchParams={searchParams} />
}
