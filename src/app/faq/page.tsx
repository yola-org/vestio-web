import { getTranslations } from "next-intl/server"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import FaqPage from "@/components/faq/FaqPage"

export async function generateMetadata() {
  const t = await getTranslations("faq")
  return { title: t("meta.title"), description: t("meta.description") }
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main>
        <FaqPage />
      </main>
      <Footer />
    </div>
  )
}
