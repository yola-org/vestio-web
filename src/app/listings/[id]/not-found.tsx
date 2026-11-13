import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function ListingNotFound() {
  const t = await getTranslations("listingDetail")

  return (
    <main className="main-container grid min-h-[60vh] place-items-center py-12 text-center">
      <div>
        <h1 className="text-4xl font-black tracking-tight">
          {t("missingTitle")}
        </h1>
        <p className="mt-3 text-primary/75">{t("missingDescription")}</p>
        <Link
          href="/search"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  )
}
