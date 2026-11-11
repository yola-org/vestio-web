"use client"

// Form state

import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { profileApi } from "@/lib/api"
import { useApiForm } from "@/hooks/use-api-form"
import { useApiQuery } from "@/hooks/use-api-query"
import { ArrowIcon, UserIcon } from "@/components/shared/Icons"
import Button from "@/components/shared/Button"
import { useNotifications } from "@/components/shared/NotificationProvider"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const { notify } = useNotifications()
  const t = useTranslations()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const { loading: isLoading } = useApiQuery(profileApi.get, {
    loading: false,
    onSuccess: (data) => {
      setFirstName(data.firstName)
      setLastName(data.lastName)
      setBio(data.bio || "")
      setPhoneNumber(data.phoneNumber || "")
    },
  })

  const { formAction, pending } = useApiForm(
    (formData) =>
      profileApi.update({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        phoneNumber: String(formData.get("phoneNumber") ?? ""),
      }),
    {
      loading: false,
      onSuccess: () => {
        notify.success(t("settings.success"))
        router.push("/profile")
      },
      onError: () => {
        notify.error(t("settings.error"))
      },
    },
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea]">
        <Header />
        <main className="main-container py-20 flex justify-center">
          <div className="animate-pulse text-xl font-bold">
            {t("settings.loading")}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />

      <main className="py-12 main-container">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black tracking-tight mb-8">
            {t("settings.title")}
          </h1>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[#173fdb]" />{" "}
              {t("settings.personalInfo")}
            </h2>

            <form action={formAction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    htmlFor="firstName"
                  >
                    {t("settings.firstName")}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    htmlFor="lastName"
                  >
                    {t("settings.lastName")}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="bio">
                  {t("settings.bio")}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("settings.bioPlaceholder")}
                  className="w-full p-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="phone">
                  {t("settings.phone")}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("settings.phonePlaceholder")}
                  className="w-full h-12 px-4 rounded-xl border border-black/15 focus:border-[#173fdb] focus:ring-2 focus:ring-[#173fdb]/10 outline-none transition"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={pending}
                  className="w-full bg-[#173fdb] text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#1335b8] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("settings.submit")} <ArrowIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
