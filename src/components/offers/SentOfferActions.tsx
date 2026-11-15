"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import Button from "@/components/shared/Button"
import Modal from "@/components/shared/Modal"
import OfferFormModal from "@/components/offers/OfferFormModal"
import { cancelOfferAction, updateOfferAction } from "@/lib/actions/listings"
import type { OfferDetailsInput } from "@/lib/actions/listings"
import type { ContactType } from "@/lib/api/schemas"

export default function SentOfferActions({
  listingId,
  listingTitle,
  offerId,
  deliveryTypes,
  initial,
  onChanged,
}: {
  listingId: string
  listingTitle: string
  offerId: string
  deliveryTypes: ContactType[]
  initial: OfferDetailsInput
  onChanged: () => void
}) {
  const t = useTranslations()
  const [modal, setModal] = useState<"edit" | "cancel" | null>(null)
  const cancelling = useRef(false)
  const [pending, setPending] = useState(false)
  const [cancelError, setCancelError] = useState<string>()
  const [cannotCancel, setCannotCancel] = useState(false)

  function closeModal() {
    setModal(null)
  }

  function finish() {
    closeModal()
    onChanged()
  }

  async function cancelOffer() {
    if (cancelling.current || cannotCancel) return

    cancelling.current = true
    setPending(true)
    setCancelError(undefined)
    try {
      const result = await cancelOfferAction(listingId, offerId)
      if (result.success) {
        finish()
      } else if (result.error.error === "ERR_OFFER_NOT_PENDING") {
        setCancelError(t("offers.notPending"))
        setCannotCancel(true)
      } else {
        setCancelError(t("offers.cancelFailed"))
      }
    } catch {
      setCancelError(t("offers.cancelFailed"))
    } finally {
      cancelling.current = false
      setPending(false)
    }
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-black/10 pt-4">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setModal("edit")}
          className="rounded-full border border-black/15 px-4 py-2 text-sm font-bold hover:bg-background"
        >
          {t("offers.edit")}
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setCancelError(undefined)
            setCannotCancel(false)
            setModal("cancel")
          }}
          className="rounded-full px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
        >
          {t("offers.cancel")}
        </button>
      </div>
      {modal === "edit" && (
        <OfferFormModal
          title={t("offers.edit")}
          submitLabel={t("common.save")}
          listingTitle={listingTitle}
          deliveryTypes={deliveryTypes}
          initial={initial}
          onClose={closeModal}
          onSubmit={(details) => updateOfferAction(listingId, offerId, details)}
          onSaved={finish}
        />
      )}
      {modal === "cancel" && (
        <Modal
          title={t("offers.cancel")}
          description={listingTitle}
          onClose={closeModal}
          dismissDisabled={pending}
        >
          <div className="grid gap-4 text-sm" aria-busy={pending}>
            <p>{t("offers.cancelConfirm")}</p>
            {cancelError && <p role="alert" className="text-red-700">{cancelError}</p>}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={pending}
                className="rounded-full px-4 py-2 font-bold hover:bg-background disabled:opacity-60"
              >
                {t("offers.keep")}
              </button>
              <Button
                onClick={() => void cancelOffer()}
                loading={pending}
                disabled={cannotCancel}
                className="rounded-full bg-red-700 px-4 py-2 font-bold text-white enabled:hover:bg-red-800 disabled:opacity-60"
              >
                {t("offers.cancel")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
