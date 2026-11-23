"use client"

import SelectInput from "./forms/SelectInput"
import type { ComponentProps } from "react"
export type { SelectOption as MultiSelectOption } from "./forms/SelectInput"

type MultiSelectProps = Omit<Extract<ComponentProps<typeof SelectInput>, {
  multiple: true
}>, "multiple">

export default function MultiSelect(props: MultiSelectProps) {
  return <SelectInput {...props} multiple />
}
