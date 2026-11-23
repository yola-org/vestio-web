interface CountBadgeProps {
  count: number
  inline?: boolean
}

export default function CountBadge({ count, inline = false }: CountBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      dir="ltr"
      className={`${
        inline ? "ms-auto" : "absolute -end-1 -top-1"
      } min-w-4.5 rounded-full border-2 border-background bg-accent px-1 text-center text-[10px] font-bold leading-4 text-white`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
