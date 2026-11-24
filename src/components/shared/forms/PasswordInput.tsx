"use client"

import { useId, useState, type ComponentProps } from "react"
import { useTranslations } from "next-intl"
import { EyeIcon, EyeOffIcon } from "@/components/shared/Icons"
import Input from "./Input"
import { useField } from "./Field"

export default function PasswordInput({
  className = "",
  disabled,
  id: providedId,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const field = useField()
  const id = providedId ?? field?.id ?? generatedId
  const t = useTranslations("auth")
  const label = t(visible ? "hidePassword" : "showPassword")

  return (
    <div className="relative">
      <Input
        {...props}
        id={id}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={`pe-12 ${className}`}
      />
      <button
        type="button"
        aria-label={label}
        aria-controls={id}
        title={label}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        className="absolute end-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-primary/60 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visible ? (
          <EyeOffIcon className="size-5" />
        ) : (
          <EyeIcon className="size-5" />
        )}
      </button>
    </div>
  )
}
