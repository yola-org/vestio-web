"use client"

import ParticipantListingCover from "@/components/shared/ParticipantListingCover"
import type { Chat } from "@/lib/chat"

export default function ChatCover({
  chat,
  className = "size-14",
}: {
  chat: Chat
  className?: string
}) {
  return (
    <ParticipantListingCover
      name={chat.buyerName}
      profileImageKey={chat.buyerProfileImageKey}
      listingId={chat.listingId}
      listingTitle={chat.listingTitle}
      listingCoverAssetKey={chat.listingCoverAssetKey}
      className={className}
    />
  )
}
