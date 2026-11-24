import Image from "next/image"
import bannerIllustration from "../../../public/banner-illustration.png"

export default function WardrobeIllustration({
  sizes = "(min-width: 1024px) 337px, (min-width: 768px) 262px, 224px",
}: {
  sizes?: string
}) {
  return (
    <Image
      src={bannerIllustration}
      alt=""
      fill
      sizes={sizes}
      className="-translate-y-[calc(5%_+_2rem)] scale-[0.935] object-contain"
    />
  )
}
