"use client"

import type { ComponentProps } from "react"
import { useField } from "./Field"
import { inputClass, controlHeight } from "./styles"

export default function Input({
  className = "",
  style,
  ...props
}: ComponentProps<"input">) {
  const field = useField()
  return (
    <input
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      {...props}
      style={{ minHeight: controlHeight, ...style }}
      className={`${inputClass} ${className}`}
    />
  )
}
