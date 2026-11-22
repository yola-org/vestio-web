"use client"

import Link from "next/link"
import { useRef, useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import Input from "@/components/shared/forms/Input"
import Textarea from "@/components/shared/forms/Textarea"
import Checkbox from "@/components/shared/forms/Checkbox"
import Field from "@/components/shared/forms/Field"
import Button from "@/components/shared/Button"
import Modal from "@/components/shared/Modal"
import type { OfferDetailsInput } from "@/lib/actions/listings"
import type { ApiResult } from "@/lib/api/result"
import type { ContactType } from "@/lib/api/schemas"

const submitClass =
  "rounded-full bg-accent px-5 py-3 text-center text-sm font-bold text-white transition enabled:hover:brightness-95 disabled:opacity-60"
const cancelClass =
  "rounded-full px-4 py-2 font-bold hover:bg-primary/5 disabled:opacity-60"

const offerErrors = {
  ERR_OFFER_ALREADY_EXISTS: "listingDetail.offerDuplicate",
  ERR_CANNOT_OFFER_ON_OWN_LISTING: "listingDetail.offerOwnListing",
  ERR_INVALID_OFFER_DELIVERY_TYPES: "listingDetail.offerDeliveryChanged",
  ERR_OFFER_NOT_PENDING: "offers.notPending",
} as const

export default function OfferFormModal({
  listingTitle,
  deliveryTypes,
  title,
  submitLabel,
  authenticated = true,
  initial,
  onClose,
  onSubmit,
  onSaved,
}: {
  listingTitle: string
  deliveryTypes: ContactType[]
  title: string
  submitLabel: string
  authenticated?: boolean
  initial?: OfferDetailsInput
  onClose: () => void
  onSubmit: (details: OfferDetailsInput) => Promise<ApiResult<null>>
  onSaved: () => void
}) {
  const t = useTranslations()
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [requiresLogin, setRequiresLogin] = useState(!authenticated)
  const [error, setError] = useState<string>()
  const [blocked, setBlocked] = useState(false)

  async function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || blocked) return

    const form = new FormData(event.currentTarget)
    const price = String(form.get("price")).replace(",", ".")
    const selectedTypes = deliveryTypes.filter((type) =>
      form.getAll("deliveryTypes").includes(type),
    )

    if (!/^[0-9]{1,17}(?:\.[0-9]{1,2})?$/.test(price) || Number(price) <= 0) {
      setError(t("listingDetail.offerInvalidAmount"))
      return
    }
    if (!selectedTypes.length) {
      setError(t("listingDetail.offerDeliveryRequired"))
      return
    }

    submitting.current = true
    setPending(true)
    setError(undefined)
    try {
      const result = await onSubmit({
        price,
        deliveryTypes: selectedTypes,
        message: String(form.get("message")).trim(),
      })
      if (result.success) {
        onSaved()
        return
      }
      if (result.error.status === 401) {
        setRequiresLogin(true)
        return
      }

      const code = result.error.error
      const messageKey = Object.prototype.hasOwnProperty.call(offerErrors, code)
        ? offerErrors[(code as keyof typeof offerErrors)]
        : undefined
      setError(
        t(
          messageKey ??
            (initial ? "offers.editFailed" : "listingDetail.offerFailed"),
        ),
      )
      setBlocked(Boolean(messageKey))
    } catch {
      setError(t(initial ? "offers.editFailed" : "listingDetail.offerFailed"))
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <Modal
      title={title}
      description={listingTitle}
      onClose={onClose}
      dismissDisabled={pending}
    >
      {requiresLogin ? (
        <div className="grid gap-4 text-sm">
          <p>{t("listingDetail.offerSignIn")}</p>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={onClose} className={cancelClass}>
              {t("common.cancel")}
            </button>
            <Link href="/login" className={submitClass}>
              {t("header.login")}
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={submitOffer}
          aria-busy={pending}
          className="grid gap-4 text-sm"
        >
          <Field
            label={t("listingDetail.offerAmount", {
              currency: t("common.currency"),
            })}
          >
            <Input
              autoFocus
              type="number"
              inputMode="decimal"
              name="price"
              required
              min="0.01"
              step="0.01"
              defaultValue={initial?.price}
              disabled={pending}
            />
          </Field>
          <fieldset disabled={pending} className="grid gap-2">
            <legend className="mb-2 font-bold">{t("sell.contact")}</legend>
            {deliveryTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2.5"
              >
                <Checkbox
                  name="deliveryTypes"
                  value={type}
                  defaultChecked={
                    initial
                      ? initial.deliveryTypes.includes(type)
                      : deliveryTypes.length === 1
                  }
                />
                {t(`sell.contactTypes.${type}`)}
              </label>
            ))}
          </fieldset>
          <Field label={t("listingDetail.offerNote")}>
            <Textarea
              name="message"
              rows={3}
              defaultValue={initial?.message}
              disabled={pending}
            />
          </Field>
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className={cancelClass}
            >
              {t("common.cancel")}
            </button>
            <Button
              type="submit"
              loading={pending}
              disabled={blocked}
              className={submitClass}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
