import { getTranslations } from "next-intl/server"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ContactPage from "@/components/contact/ContactPage"

export async function generateMetadata() {
  const t = await getTranslations("contact")
  return { title: t("meta.title"), description: t("meta.description") }
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main>
        <ContactPage />
      </main>
      <Footer />
    </div>
  )
}
