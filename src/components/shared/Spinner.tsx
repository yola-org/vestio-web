export default function Spinner({
  className = "size-5 border-2",
  label,
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 animate-spin rounded-full border-current/25 border-t-current motion-reduce:animate-none ${className}`}
    />
  )
}
