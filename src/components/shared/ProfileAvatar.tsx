import { useState } from "react"
import { UserIcon } from "@/components/shared/Icons"

type ProfileAvatarProps = {
  src?: string | null
  alt?: string
  firstName?: string
  lastName?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export default function ProfileAvatar({
  src,
  alt = "Photo de profil",
  firstName,
  lastName,
  size = "md",
}: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((name) => name![0])
    .join("")
    .toUpperCase()

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-20 w-20 text-xl",
    xl: "h-32 w-32 text-3xl",
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/15 font-bold text-[#173fdb] ${sizeClasses[size]}`}
      role="img"
      aria-label={alt}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <span className="translate-y-[1.5px]">{initials}</span>
      ) : (
        <UserIcon
          className={
            size === "xl"
              ? "h-12 w-12"
              : size === "lg"
                ? "h-10 w-10"
                : "h-5 w-5"
          }
        />
      )}
    </div>
  )
}
