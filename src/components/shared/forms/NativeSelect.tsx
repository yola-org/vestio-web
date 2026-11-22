"use client"

import type { ComponentProps } from "react"
import { useField } from "./Field"
import { inputClass, controlHeight } from "./styles"

export default function NativeSelect({
  className = "",
  style,
  ...props
}: ComponentProps<"select">) {
  const field = useField()
  return (
    <select
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      {...props}
      style={{ minHeight: controlHeight, ...style }}
      className={`${inputClass} ${className}`}
    />
  )
}
