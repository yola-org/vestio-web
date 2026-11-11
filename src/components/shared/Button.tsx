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
      className={className}
    >
      {loading && (
        <span
          className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current/35 border-t-current"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
