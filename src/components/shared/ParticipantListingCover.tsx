"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import ProfileAvatar from "./ProfileAvatar"
import { CameraIcon } from "./Icons"
import { getProfileImageUrl } from "@/lib/profile-images"
import { getListingImageUrls } from "@/lib/listing-images"

type Props = {
  name?: string
  profileImageKey?: string | null
  listingId: string
  listingTitle: string
  listingCoverAssetKey?: string | null
  className?: string
}

export default function ParticipantListingCover({
  name,
  profileImageKey,
  listingId,
  listingTitle,
  listingCoverAssetKey,
  className = "size-14",
}: Props) {
  const t = useTranslations("chats")
  const listing = {
    id: listingId,
    assetKeys: listingCoverAssetKey ? [listingCoverAssetKey] : [],
  }
  const sources = [
    ...getListingImageUrls(listing, "thumbnail"),
    ...getListingImageUrls(listing, "thumbnail", "nested"),
  ]
  return (
    <div
      dir="ltr"
      className={`flex shrink-0 overflow-hidden rounded-full border border-black/10 bg-muted-accent/25 ${className}`}
    >
      <div className="h-full w-1/2 overflow-hidden border-r border-white">
        <ProfileAvatar
          src={getProfileImageUrl(profileImageKey)}
          alt={name}
          firstName={name?.trim().split(/\s+/)[0]}
          lastName={name?.trim().split(/\s+/).slice(1).at(-1)}
          shape="square"
          className="h-full w-full text-xs"
        />
      </div>
      <ListingHalf
        key={sources.join("|")}
        sources={sources}
        alt={listingTitle}
        fallbackLabel={t("noCover")}
      />
    </div>
  )
}

function ListingHalf({
  sources,
  alt,
  fallbackLabel,
}: {
  sources: string[]
  alt: string
  fallbackLabel: string
}) {
  const [index, setIndex] = useState(0)
  return (
    <div className="flex h-full w-1/2 items-center justify-center overflow-hidden text-primary/30">
      {sources[index] ? (
        <img
          src={sources[index]}
          alt={alt}
          className="size-full object-cover"
          onError={() => setIndex((value) => value + 1)}
        />
      ) : (
        <span role="img" aria-label={fallbackLabel}>
          <CameraIcon className="size-5" />
        </span>
      )}
    </div>
  )
}
