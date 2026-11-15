import Spinner from "@/components/shared/Spinner"
import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Disables the button and displays a spinner while an action is pending. */
  loading?: boolean
  children: ReactNode
}

export default function Button({
  loading = false,
  disabled,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={loading ? `relative ${className ?? ""}` : className}
    >
      {loading ? (
        <>
          <span className="inline-flex items-center justify-center gap-2 opacity-0">
            {children}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <Spinner />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
