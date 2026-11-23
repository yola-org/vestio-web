"use client"

import { useState } from "react"
import Modal from "./Modal"

export default function ImageLightbox({
  title,
  sources,
  onClose,
}: {
  title: string
  sources: string[]
  onClose: () => void
}) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const images = [...new Set([...sources, "/listing-image-unavailable.png"])]

  return (
    <Modal title={title} onClose={onClose} size="full">
      <img
        src={images[sourceIndex]}
        alt={title}
        className="h-full w-full object-contain"
        onError={
          sourceIndex < images.length - 1
            ? () => setSourceIndex((index) => index + 1)
            : undefined
        }
      />
    </Modal>
  )
}
