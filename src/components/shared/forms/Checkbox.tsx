import type { ComponentProps } from "react"
import { checkboxClass } from "./styles"

export default function Checkbox({
  className = "",
  ...props
}: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      {...props}
      type="checkbox"
      className={`${checkboxClass} ${className}`}
    />
  )
}
