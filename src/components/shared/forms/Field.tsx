"use client"

import { createContext, useContext, useId, type ReactNode } from "react"
import { labelClass } from "./styles"

const FieldContext = createContext<{
  id: string
  describedBy?: string
  invalid: boolean
} | null>(null)
export function useField() {
  return useContext(FieldContext)
}

export default function Field({
  id: providedId,
  label,
  description,
  error,
  hideLabel = false,
  children,
}: {
  id?: string
  label: ReactNode
  description?: string
  error?: string
  hideLabel?: boolean
  children: ReactNode
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const describedBy =
    [description && `${id}-description`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error) }}>
      <div className="min-w-0 space-y-2">
        <label htmlFor={id} className={hideLabel ? "sr-only" : labelClass}>
          {label}
        </label>
        {children}
        {description && (
          <p id={`${id}-description`} className="text-xs text-primary/60">
            {description}
          </p>
        )}
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}
