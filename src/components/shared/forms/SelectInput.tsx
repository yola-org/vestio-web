"use client"

import { useId } from "react"
import { useLocale, useTranslations } from "next-intl"
import Field from "./Field"
import Checkbox from "./Checkbox"
import { controlBaseClass, controlHeight } from "./styles"
import Select, {
  components,
  type GroupBase,
  type OptionProps,
  type OptionsOrGroups,
} from "react-select"

export interface SelectOption {
  value: string
  label: string
}

function CheckboxOption(props: OptionProps<SelectOption, boolean>) {
  return (
    <components.Option {...props}>
      <span
        className="flex items-center gap-2.5"
        data-option-value={props.data.value}
      >
        {props.isMulti && (
          <Checkbox
            checked={props.isSelected}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none"
          />
        )}
        <span>{props.label}</span>
      </span>
    </components.Option>
  )
}

interface SelectBaseProps {
  name: string
  label: string
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>
  placeholder?: string
  disabled?: boolean
  compact?: boolean
  submitValues?: boolean
  error?: string
  description?: string
  classNamePrefix?: string
}
interface MultipleSelectProps extends SelectBaseProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}
interface SingleSelectProps extends SelectBaseProps {
  multiple?: false
  value: string
  onChange: (value: string) => void
}
export type SelectInputProps = MultipleSelectProps | SingleSelectProps

export default function SelectInput(props: SelectInputProps) {
  const {
    name,
    label,
    options,
    placeholder,
    disabled = false,
    compact = false,
    submitValues = true,
    error,
    description,
    classNamePrefix,
  } = props
  const id = useId()
  const locale = useLocale()
  const t = useTranslations()
  const flatOptions = options.flatMap((option) =>
    "options" in option ? option.options : [option],
  )
  const values = props.multiple ? props.value : props.value ? [props.value] : []
  const selected = values.map(
    (id) =>
      flatOptions.find((option) => option.value === id) ?? {
        value: id,
        label: id,
      },
  )

  return (
    <div
      className="min-w-0"
      data-multiselect={props.multiple ? name : undefined}
    >
      <Field
        id={id}
        label={label}
        hideLabel={compact}
        error={error}
        description={description}
      >
        <Select<SelectOption, boolean>
          instanceId={id}
          inputId={id}
          aria-label={label}
          isMulti={Boolean(props.multiple)}
          classNamePrefix={classNamePrefix}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [description && `${id}-description`, error && `${id}-error`]
              .filter(Boolean)
              .join(" ") || undefined
          }
          isClearable
          isRtl={locale === "ar"}
          isDisabled={disabled}
          options={options}
          value={props.multiple ? selected : (selected[0] ?? null)}
          onChange={(selected) => {
            if (props.multiple)
              props.onChange(
                Array.isArray(selected)
                  ? selected.map((option: SelectOption) => option.value)
                  : [],
              )
            else
              props.onChange(
                selected && "value" in selected ? selected.value : "",
              )
          }}
          placeholder={placeholder ?? t("search.all")}
          noOptionsMessage={() => t("filters.noOptions")}
          closeMenuOnSelect={!props.multiple}
          hideSelectedOptions={false}
          blurInputOnSelect={false}
          tabSelectsValue={false}
          components={{ Option: CheckboxOption }}
          unstyled
          styles={{
            control: (base) => ({ ...base, minHeight: controlHeight }),
            valueContainer: (base) =>
              compact
                ? { ...base, flexWrap: "nowrap", overflowX: "auto" }
                : base,
            multiValue: (base) => (compact ? { ...base, flexShrink: 0 } : base),
          }}
          classNames={{
            control: ({ isFocused, isDisabled }) =>
              `${controlBaseClass} min-h-12 ${
                error
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : isFocused
                    ? "border-deep-accent ring-2 ring-deep-accent/10"
                    : "border-primary/15 hover:border-primary/25"
              } ${isDisabled ? "opacity-50" : ""}`,
            valueContainer: () => `gap-1 px-3 py-2`,
            placeholder: () => "text-primary/60",
            input: () => "text-primary",
            singleValue: () => "text-primary",
            multiValue: () =>
              "min-w-0 rounded-md bg-deep-accent/10 text-xs text-deep-accent",
            multiValueLabel: () => "px-1.5 py-1",
            multiValueRemove: () => "rounded-e-md px-1 hover:bg-deep-accent/15",
            indicatorsContainer: () => "text-primary/50",
            dropdownIndicator: () => "px-2",
            clearIndicator: () => "cursor-pointer p-1 hover:text-deep-accent",
            menu: () =>
              "z-50 mt-2 min-w-56 overflow-hidden rounded-xl border border-primary/10 bg-white p-1 shadow-xl",
            menuList: () => "max-h-60",
            option: ({ isFocused, isSelected }) =>
              `cursor-pointer rounded-lg px-3 py-2.5 text-sm ${
                isSelected
                  ? "bg-deep-accent/10 font-semibold text-deep-accent"
                  : isFocused
                    ? "bg-primary/5 text-primary"
                    : "text-primary/75"
              }`,
            groupHeading: () =>
              "border-b border-primary/8 px-3 pb-2 pt-3 text-xs font-bold text-primary/60",
            noOptionsMessage: () => "p-3 text-sm text-primary/60",
          }}
        />
      </Field>
      {submitValues &&
        (props.multiple ? (
          props.value.map((id) => (
            <input key={id} type="hidden" name={name} value={id} />
          ))
        ) : (
          <input type="hidden" name={name} value={props.value} />
        ))}
    </div>
  )
}
