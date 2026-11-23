"use client"

import { useEffect, useId, useState, type ChangeEvent } from "react"
import { useTranslations } from "next-intl"
import ProfileAvatar from "@/components/shared/ProfileAvatar"
import Spinner from "@/components/shared/Spinner"
import { profileApi } from "@/lib/api"
import { notifyAuthChanged } from "@/lib/auth"
import { getProfileImageUrl } from "@/lib/profile-images"

export default function ProfileImageUpload({
  firstName,
  lastName,
  imageKey,
  onUploaded,
  onUploadingChange,
}: {
  firstName: string
  lastName: string
  imageKey?: string | null
  onUploaded: (key: string | null | undefined) => void
  onUploadingChange?: (uploading: boolean) => void
}) {
  const t = useTranslations("settings")
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState<string>()

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0]
    event.target.value = ""
    if (!image) return
    setSaved(false)
    setError("")
    if (
      !image.size ||
      image.size > 10 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(image.type)
    ) {
      setError(t("imageInvalid"))
      return
    }
    setPreview(URL.createObjectURL(image))
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const result = await profileApi.uploadImage(image)
      if (!result.success) {
        setError(t("imageError"))
        return
      }
      onUploaded(result.data.profileImageKey)
      notifyAuthChanged()
      setSaved(true)
    } catch {
      setError(t("imageError"))
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      setPreview(undefined)
    }
  }

  return (
    <section
      id="profile-image"
      aria-labelledby={`${inputId}-heading`}
      className="mb-8 border-b border-primary/10 pb-8"
    >
      <h3 id={`${inputId}-heading`} className="mb-4 text-sm font-bold">
        {t("profileImage")}
      </h3>
      <div className="flex items-center gap-5">
        <ProfileAvatar
          src={preview ?? getProfileImageUrl(imageKey)}
          firstName={firstName}
          lastName={lastName}
          size="lg"
          alt={t("profileImage")}
        />
        <div className="min-w-0 space-y-2">
          <label
            htmlFor={inputId}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-primary/15 px-4 py-2 text-sm font-bold focus-within:outline-2 focus-within:outline-deep-accent ${
              uploading ? "opacity-50" : "hover:bg-primary/5"
            }`}
          >
            {uploading && <Spinner />}
            {t(uploading ? "imageUploading" : "changeImage")}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={upload}
              aria-describedby={`${inputId}-hint`}
              className="sr-only"
            />
          </label>
          <p id={`${inputId}-hint`} className="text-xs text-primary/60">
            {t("imageHint")}
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-deep-accent">
              {t("imageSaved")}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
