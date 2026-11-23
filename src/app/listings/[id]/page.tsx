import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import {
  ListingDetailActions,
  ListingDetailCarousel,
  ListingDetailValues,
} from "@/components/listings/ListingDetailActions"
import ProfileAvatar from "@/components/shared/ProfileAvatar"
import PublishedDate from "@/components/shared/PublishedDate"
import { getProfileImageUrl } from "@/lib/profile-images"
import {
  ArrowIcon,
  ChevronIcon,
  FemaleIcon,
  MaleIcon,
} from "@/components/shared/Icons"
import { AUTH_INDICATOR_COOKIE } from "@/constants/auth"
import { getListingAction } from "@/lib/actions/listings"
import { getCategoriesAction } from "@/lib/actions/profile"
import { ContactTypeSchema } from "@/lib/api/schemas"
import { categoryHref, findCategoryPath } from "@/lib/category-utils"
import { getListingImageUrls } from "@/lib/listing-images"

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) notFound()

  const [result, t, format, cookieStore, categories] = await Promise.all([
    getListingAction(id),
    getTranslations(),
    getFormatter(),
    cookies(),
    getCategoriesAction(),
  ])

  if (!result.success) {
    if (result.error.status === 404) notFound()
    throw new Error("Failed to load listing")
  }

  const listing = result.data
  if (
    listing.status &&
    listing.status !== "AVAILABLE" &&
    listing.status !== "SOLD"
  ) {
    notFound()
  }

  const photos = getListingImageUrls(listing)
  const legacyPhotos = getListingImageUrls(listing, "original", "nested")
  const categoryPath = findCategoryPath(
    categories.success ? categories.data : [],
    listing.categoryId,
  )
  const breadcrumbs = categoryPath.length
    ? categoryPath.map(({ id, name }, index) => ({
        id,
        name,
        href: categoryHref(
          ...categoryPath.slice(0, index + 1).map((category) => category.name),
        ),
      }))
    : listing.categoryName
      ? [
          {
            id: listing.categoryId,
            name: listing.categoryName,
            href: undefined,
          },
        ]
      : []
  const authenticated = cookieStore.get(AUTH_INDICATOR_COOKIE)?.value === "1"
  const colors = [
    ...new Set(listing.colors?.map((color) => color.trim()).filter(Boolean)),
  ]
  const gender = listing.gender?.trim().toUpperCase()
  const deliveryTypes = [...new Set(listing.contactTypes ?? [])].filter(
    (type) => ContactTypeSchema.options.includes(type),
  )
  const delivery = deliveryTypes.map((type) => t(`sell.contactTypes.${type}`))
  const details = [
    [t("filters.condition"), t(`conditions.${listing.condition}.label`)],
    [t("sell.contact"), format.list(delivery, { type: "unit" })],
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-primary">
      <Header />
      <main className="main-container flex-1 pt-6 pb-7 sm:pb-10">
        <Link
          href="/search"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold hover:underline sm:mb-8"
        >
          <ArrowIcon aria-hidden="true" className="size-4 rotate-180" />
          {t("listingDetail.back")}
        </Link>

        <article className="grid items-stretch md:grid-cols-[1.2fr_1fr]">
          <ListingDetailCarousel
            key={listing.id}
            photos={photos}
            legacyPhotos={legacyPhotos}
            title={listing.title}
          />

          <div className="min-w-0 border border-black/10 bg-white px-5 pt-4 pb-5 max-md:rounded-b-3xl max-md:border-t-0 sm:px-6 sm:pb-6 md:rounded-e-3xl md:border-s-0 lg:px-8 lg:pt-6 lg:pb-8">
            <div className="mb-2 flex flex-wrap items-center gap-2 empty:hidden">
              {breadcrumbs.length > 0 && (
                <nav aria-label={t("listingDetail.categoryBreadcrumb")}>
                  <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-primary/70">
                    {breadcrumbs.map(({ id, name, href }, index) => (
                      <li key={id} className="flex min-w-0 items-center gap-2">
                        {index > 0 && (
                          <ChevronIcon className="size-3.5 shrink-0 -rotate-90 rtl:rotate-90" />
                        )}
                        {href ? (
                          <Link
                            href={href}
                            className="break-words font-semibold hover:text-primary hover:underline"
                          >
                            {name}
                          </Link>
                        ) : (
                          <span>{name}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              {listing.status === "SOLD" && (
                <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">
                  {t("listingDetail.sold")}
                </span>
              )}
            </div>
            <h1
              id="listing-title"
              className="break-words text-2xl font-black tracking-tight lg:text-4xl"
            >
              {listing.title}
            </h1>
            <p className="mt-2 text-2xl font-black lg:text-3xl">
              {format.number(listing.price)} {t("common.currency")}
            </p>
            <div className="mt-4 grid gap-2">
              <ListingDetailActions
                key={listing.id}
                listing={listing}
                deliveryTypes={deliveryTypes}
                authenticated={authenticated}
              />
            </div>

            {(listing.sellerFirstName || listing.sellerLastName) && (
              <div className="mt-4 flex items-center gap-2 border-t border-black/10 pt-4">
                <ProfileAvatar
                  src={getProfileImageUrl(listing.sellerProfileImageKey)}
                  firstName={listing.sellerFirstName ?? undefined}
                  lastName={listing.sellerLastName ?? undefined}
                  size="sm"
                />
                <div>
                  <span className="text-sm font-semibold">
                    {[listing.sellerFirstName, listing.sellerLastName]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                  {listing.createdAt && (
                    <p className="text-xs text-black/50">
                      <PublishedDate dateTime={listing.createdAt} />
                    </p>
                  )}
                </div>
              </div>
            )}

            {listing.description?.trim() && (
              <section className="mt-4 border-t border-black/10 pt-4">
                <h2 className="text-lg font-black">{t("sell.description")}</h2>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-primary/75">
                  {listing.description}
                </p>
              </section>
            )}

            <section className="mt-4 border-t border-black/10 pt-4">
              <h2 className="text-lg font-black">
                {t("listingDetail.details")}
              </h2>
              <dl className="mt-2 divide-y divide-black/10 text-sm">
                {details
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="grid grid-cols-2 gap-3 py-2">
                      <dt className="text-primary/70">{label}</dt>
                      <dd className="break-words font-bold">{value}</dd>
                    </div>
                  ))}
                <ListingDetailValues
                  label={t("filters.size")}
                  values={listing.sizeNames ?? []}
                />
                <ListingDetailValues
                  label={t("sell.cities")}
                  values={listing.cityNames ?? []}
                />
                <ListingDetailValues
                  label={t("listingDetail.colors")}
                  values={colors}
                  swatches
                />
                <div className="grid grid-cols-2 items-center gap-3 py-2">
                  <dt className="text-primary/70">{t("preferences.gender")}</dt>
                  <dd className="flex items-center gap-2 font-bold">
                    {gender === "MALE" && (
                      <MaleIcon className="size-5 shrink-0 text-blue-600" />
                    )}
                    {gender === "FEMALE" && (
                      <FemaleIcon className="size-5 shrink-0 text-pink-600" />
                    )}
                    {gender === "MALE" ||
                    gender === "FEMALE" ||
                    gender === "UNISEX"
                      ? t(`preferences.genders.${gender}`)
                      : t("listingDetail.genderUnspecified")}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
