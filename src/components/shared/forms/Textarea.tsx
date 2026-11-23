"use client"

import type { ComponentProps } from "react"
import { useField } from "./Field"
import { inputClass, controlHeight } from "./styles"

export default function Textarea({
  className = "",
  style,
  ...props
}: ComponentProps<"textarea">) {
  const field = useField()
  return (
    <textarea
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      {...props}
      style={{ minHeight: controlHeight, ...style }}
      className={`${inputClass} resize-y ${className}`}
    />
  )
}
