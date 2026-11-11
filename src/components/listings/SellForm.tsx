"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CameraIcon, CheckIcon } from "@/components/shared/Icons"
import Button from "@/components/shared/Button"
import ProductCard from "@/components/shared/ProductCard"
import { listingsApi, profileApi } from "@/lib/api"
import { replaceListingAssetsAction } from "@/lib/actions/listings"
import { useApiAction } from "@/hooks/use-api-action"
import { useApiQuery } from "@/hooks/use-api-query"
import {
  ConditionSchema,
  ContactTypeSchema,
  ListingInputSchema,
  type ContactType,
  type ListingInput,
} from "@/lib/api/schemas"
import styles from "./SellForm.module.css"

const steps = ["photos", "details", "category", "sale", "review"] as const
const reviewStep = steps.length - 1
const maxPhotos = 10
const maxPhotoBytes = 10 * 1024 * 1024
const maxPhotoTotal = 49 * 1024 * 1024
const photoAccept = ".jpg,.jpeg,.png,.webp"
const fieldClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 focus:border-deep-accent focus:outline-none"
const primaryClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition disabled:opacity-50"
const nextClass = `${primaryClass} bg-deep-accent hover:bg-deep-accent/90`
const backClass =
  "rounded-full border border-black/15 px-6 py-3 text-sm font-bold transition hover:bg-background disabled:opacity-50"

type Photo = {
  file: File
  url: string
}
type FormError = "photosRequired" | "photosInvalid" | "titleRequired" | "categoryRequired" | "priceInvalid" | "quantityInvalid" | "citiesRequired" | "publishError" | "uploadError"

function toggleSelection(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
        selected
          ? "border-deep-accent bg-deep-accent text-white"
          : "border-black/10 bg-background hover:border-deep-accent/50"
      }`}
    >
      {children}
    </button>
  )
}

export default function SellForm() {
  const router = useRouter()
  const t = useTranslations()
  const [step, setStep] = useState(0)
  const [backward, setBackward] = useState(false)
  const [error, setError] = useState<FormError | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string>()
  const [published, setPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<ListingInput>({
    title: "",
    description: "",
    price: 0,
    quantity: 1,
    condition: "VERY_GOOD",
    contactTypes: ["MEETUP"],
    cityIds: [],
    categoryId: "",
    sizeIds: [],
  })
  const [parentId, setParentId] = useState("")
  const heading = useRef<HTMLHeadingElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const photoDragDepth = useRef(0)
  const photoUrls = useRef(new Set<string>())
  const draft = useRef<{
    id: string
    formData: ListingInput
  } | null>(null)
  const publishInProgress = useRef(false)

  const citiesQuery = useApiQuery(profileApi.getCities, {
    critical: true,
    loading: false,
  })
  const categoriesQuery = useApiQuery(profileApi.getCategories, {
    critical: true,
    loading: false,
  })
  const sizesQuery = useApiQuery(profileApi.getSizes, {
    critical: true,
    loading: false,
  })
  const create = useApiAction(listingsApi.create, { loading: false })
  const update = useApiAction(listingsApi.update, { loading: false })
  const upload = useApiAction(replaceListingAssetsAction, { loading: false })

  const cities = citiesQuery.data ?? []
  const parents =
    categoriesQuery.data?.filter((category) => !category.parentId) ?? []
  const selectedParent = parents.find((category) => category.id === parentId)
  const subcategories = selectedParent?.subCategories?.length
    ? selectedParent.subCategories
    : (categoriesQuery.data?.filter(
        (category) => category.parentId === parentId,
      ) ?? [])
  const selectedCategory =
    subcategories.find((category) => category.id === formData.categoryId) ??
    (selectedParent?.id === formData.categoryId ? selectedParent : undefined)
  const availableSizes =
    selectedCategory?.sizeGroup?.sizes ??
    sizesQuery.data?.find((group) => group.id === selectedCategory?.sizeGroupId)
      ?.sizes ??
    []
  const loading =
    citiesQuery.loading || categoriesQuery.loading || sizesQuery.loading

  useEffect(() => {
    const urls = photoUrls.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  function moveTo(nextStep: number) {
    photoDragDepth.current = 0
    setIsDraggingPhotos(false)
    setBackward(nextStep < step)
    setError(null)
    setStep(nextStep)
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: "nearest" })
    })
  }

  function changeDetails(changes: Partial<ListingInput>) {
    setError(null)
    setFormData((previous) => ({ ...previous, ...changes }))
  }

  function pickPhotos(event: ChangeEvent<HTMLInputElement>) {
    addPhotos(Array.from(event.currentTarget.files ?? []))
    event.currentTarget.value = ""
  }

  function enterPhotoDropZone(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return

    event.preventDefault()
    photoDragDepth.current += 1
    setIsDraggingPhotos(true)
  }

  function leavePhotoDropZone() {
    // Moving between the drop zone and its children fires additional events.
    photoDragDepth.current = Math.max(0, photoDragDepth.current - 1)
    if (photoDragDepth.current === 0) setIsDraggingPhotos(false)
  }

  function dragOverPhotoDropZone(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return

    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  function dropPhotos(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    photoDragDepth.current = 0
    setIsDraggingPhotos(false)
    addPhotos(Array.from(event.dataTransfer.files))
  }

  function addPhotos(files: File[]) {
    if (!files.length) return

    const total = [...photos.map((photo) => photo.file), ...files]
    const invalidFile = files.some(
      (file) =>
        !file.size ||
        file.size > maxPhotoBytes ||
        !file.type.startsWith("image/") ||
        !/\.(jpe?g|png|webp)$/i.test(file.name),
    )
    if (
      invalidFile ||
      total.length > maxPhotos ||
      total.reduce((bytes, file) => bytes + file.size, 0) > maxPhotoTotal
    ) {
      setError("photosInvalid")
      return
    }

    const additions = files.map((file) => {
      const url = URL.createObjectURL(file)
      photoUrls.current.add(url)
      return { file, url }
    })
    setPhotos([...photos, ...additions])
    setError(null)
  }

  function removePhoto(url: string) {
    URL.revokeObjectURL(url)
    photoUrls.current.delete(url)
    setPhotos(photos.filter((photo) => photo.url !== url))
    if (previewPhoto === url) setPreviewPhoto(undefined)
    setError(null)
  }

  function validateStep(index: number): FormError | null {
    switch (steps[index]) {
      case "photos":
        return photos.length ? null : "photosRequired"
      case "details":
        return formData.title.trim() ? null : "titleRequired"
      case "category":
        return selectedCategory ? null : "categoryRequired"
      case "sale":
        if (!ListingInputSchema.shape.price.safeParse(formData.price).success)
          return "priceInvalid"
        if (
          !ListingInputSchema.shape.quantity.safeParse(formData.quantity)
            .success
        )
          return "quantityInvalid"
        return formData.cityIds.length ? null : "citiesRequired"
      default:
        return null
    }
  }

  async function publish() {
    if (publishInProgress.current) return
    publishInProgress.current = true
    setSubmitting(true)
    setError(null)

    try {
      const saved = draft.current
      let listingId: string
      if (saved?.formData === formData) {
        listingId = saved.id
      } else {
        const result = saved
          ? await update.execute(saved.id, formData)
          : await create.execute(formData)
        if (!result.success) {
          setError("publishError")
          return
        }
        listingId = result.data.id
        draft.current = { id: listingId, formData }
      }

      const images = new FormData()
      for (const { file } of photos) images.append("images", file)
      const result = await upload.execute(listingId, images)
      if (!result.success) {
        setError("uploadError")
        return
      }
      setPublished(true)
      requestAnimationFrame(() => heading.current?.focus())
    } finally {
      publishInProgress.current = false
      setSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const invalid = validateStep(step)
    if (invalid) {
      setError(invalid)
      return
    }

    if (step < reviewStep) {
      moveTo(step + 1)
    } else {
      void publish()
    }
  }

  if (loading) {
    return (
      <div
        className="flex justify-center py-20"
        role="status"
        aria-label={t("sell.loading")}
      >
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-deep-accent border-t-transparent" />
      </div>
    )
  }

  if (published) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center sm:p-12">
        <CheckIcon className="mx-auto mb-4 h-8 w-8 text-deep-accent" />
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-black">
          {t("sell.successTitle")}
        </h2>
        <p className="mb-6 mt-2 text-sm text-black/60">
          {t("sell.successBody")}
        </p>
        <Button onClick={() => router.push("/")} className={nextClass}>
          {t("sell.home")}
        </Button>
      </section>
    )
  }

  const currentPhoto =
    photos.find((photo) => photo.url === previewPhoto) ?? photos[0]
  const sizeNames = availableSizes
    .filter((size) => formData.sizeIds?.includes(size.id))
    .map((size) => size.name)
  const cityNames = cities
    .filter((city) => formData.cityIds.includes(city.id))
    .map((city) => city.name)

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl">
      <ol
        aria-label={t("sell.progress")}
        className="mb-6 grid grid-cols-5 gap-1.5 sm:gap-3"
      >
        {steps.map((name, index) => (
          <li key={name} aria-current={index === step ? "step" : undefined}>
            <button
              type="button"
              disabled={index >= step || submitting}
              onClick={() => moveTo(index)}
              className={`flex w-full flex-col items-center gap-2 border-t-4 px-0.5 pt-3 text-center text-[10px] font-bold leading-tight sm:text-xs ${
                index <= step
                  ? "border-deep-accent text-deep-accent"
                  : "border-black/10 text-black/55"
              } enabled:hover:bg-deep-accent/5`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                  index <= step ? "bg-deep-accent text-white" : "bg-black/5"
                }`}
              >
                {index < step ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {t(`sell.steps.${name}`)}
            </button>
          </li>
        ))}
      </ol>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <fieldset disabled={submitting} className="min-w-0">
          <section
            key={step}
            aria-labelledby="sell-step-heading"
            className={`${styles.panel} ${
              backward ? styles.backward : ""
            } space-y-6 p-5 sm:p-8`}
          >
            <h2
              ref={heading}
              id="sell-step-heading"
              tabIndex={-1}
              className="text-2xl font-black tracking-tight"
            >
              {t(`sell.headings.${steps[step]}`)}
            </h2>

            {step === 0 && (
              <>
                <div
                  onDragEnter={enterPhotoDropZone}
                  onDragLeave={leavePhotoDropZone}
                  onDragOver={dragOverPhotoDropZone}
                  onDrop={dropPhotos}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
                    isDraggingPhotos
                      ? "border-deep-accent bg-deep-accent/10"
                      : "border-black/15 bg-background/60"
                  }`}
                >
                  <CameraIcon className="mx-auto h-9 w-9 text-accent" />
                  <p className="mx-auto mb-4 mt-3 max-w-md text-sm text-black/65">
                    {t("sell.photosHint")}
                  </p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept={photoAccept}
                    multiple
                    hidden
                    onChange={pickPhotos}
                  />
                  <Button
                    onClick={() => fileInput.current?.click()}
                    className={backClass}
                  >
                    {t("sell.selectFiles")}
                  </Button>
                </div>
                {photos.length > 0 && (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {photos.map(({ file, url }, index) => (
                      <li
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-xl bg-background"
                      >
                        <img
                          src={url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute bottom-2 start-2 rounded-full bg-white/95 px-2 py-1 text-xs font-bold">
                            {t("sell.coverPhoto")}
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label={t("sell.removePhoto", {
                            name: file.name,
                          })}
                          onClick={() => removePhoto(url)}
                          className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-xl shadow-sm"
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <label className="block space-y-2 text-sm font-bold">
                  <span>{t("sell.listingTitle")}</span>
                  <input
                    required
                    className={fieldClass}
                    value={formData.title}
                    placeholder={t("sell.listingTitlePlaceholder")}
                    onChange={(event) =>
                      changeDetails({ title: event.target.value })
                    }
                  />
                </label>
                <label className="block space-y-2 text-sm font-bold">
                  <span>{t("sell.description")}</span>
                  <textarea
                    rows={5}
                    className={fieldClass}
                    value={formData.description ?? ""}
                    placeholder={t("sell.descriptionPlaceholder")}
                    onChange={(event) =>
                      changeDetails({ description: event.target.value })
                    }
                  />
                </label>
                <fieldset>
                  <legend className="mb-3 text-sm font-bold">
                    {t("sell.condition")}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ConditionSchema.options.map((condition) => (
                      <label
                        key={condition}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 p-3 has-checked:border-deep-accent has-checked:bg-deep-accent/5"
                      >
                        <input
                          type="radio"
                          name="condition"
                          checked={formData.condition === condition}
                          onChange={() => changeDetails({ condition })}
                          className="mt-1 accent-deep-accent"
                        />
                        <span>
                          <span className="block text-sm font-bold">
                            {t(`conditions.${condition}.label`)}
                          </span>
                          <span className="block text-xs text-black/60">
                            {t(`conditions.${condition}.description`)}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <>
                <fieldset>
                  <legend className="mb-3 text-sm font-bold">
                    {t("sell.mainCategory")}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {parents.map((category) => (
                      <Choice
                        key={category.id}
                        selected={parentId === category.id}
                        onClick={() => {
                          if (parentId === category.id) return
                          setParentId(category.id)
                          const hasChildren =
                            category.subCategories?.length ||
                            categoriesQuery.data?.some(
                              (child) => child.parentId === category.id,
                            )
                          changeDetails({
                            categoryId: hasChildren ? "" : category.id,
                            sizeIds: [],
                          })
                        }}
                      >
                        {category.name}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
                {subcategories.length > 0 && (
                  <fieldset>
                    <legend className="mb-3 text-sm font-bold">
                      {t("sell.subcategory")}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((category) => (
                        <Choice
                          key={category.id}
                          selected={formData.categoryId === category.id}
                          onClick={() => {
                            if (formData.categoryId !== category.id)
                              changeDetails({
                                categoryId: category.id,
                                sizeIds: [],
                              })
                          }}
                        >
                          {category.name}
                        </Choice>
                      ))}
                    </div>
                  </fieldset>
                )}
                {availableSizes.length > 0 && (
                  <fieldset>
                    <legend className="mb-3 text-sm font-bold">
                      {t("sell.size")}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <Choice
                          key={size.id}
                          selected={
                            formData.sizeIds?.includes(size.id) ?? false
                          }
                          onClick={() =>
                            changeDetails({
                              sizeIds: toggleSelection(
                                formData.sizeIds ?? [],
                                size.id,
                              ),
                            })
                          }
                        >
                          {size.name}
                        </Choice>
                      ))}
                    </div>
                  </fieldset>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm font-bold">
                    <span>
                      {t("sell.price", { currency: t("common.currency") })}
                    </span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      inputMode="decimal"
                      className={fieldClass}
                      value={
                        Number.isNaN(formData.price) || formData.price === 0
                          ? ""
                          : formData.price
                      }
                      onChange={(event) =>
                        changeDetails({ price: event.target.valueAsNumber })
                      }
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-bold">
                    <span>{t("sell.quantity")}</span>
                    <input
                      required
                      type="number"
                      min="1"
                      max="2147483647"
                      className={fieldClass}
                      value={
                        Number.isNaN(formData.quantity) ? "" : formData.quantity
                      }
                      onChange={(event) =>
                        changeDetails({ quantity: event.target.valueAsNumber })
                      }
                    />
                  </label>
                </div>
                <fieldset>
                  <legend className="mb-3 text-sm font-bold">
                    {t("sell.cities")}
                  </legend>
                  <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto p-1">
                    {cities.map((city) => (
                      <Choice
                        key={city.id}
                        selected={formData.cityIds.includes(city.id)}
                        onClick={() =>
                          changeDetails({
                            cityIds: toggleSelection(formData.cityIds, city.id),
                          })
                        }
                      >
                        {city.name}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
                <label className="block space-y-2 text-sm font-bold">
                  <span>{t("sell.contact")}</span>
                  <select
                    className={fieldClass}
                    value={formData.contactTypes[0]}
                    onChange={(event) =>
                      changeDetails({
                        contactTypes: [event.target.value as ContactType],
                      })
                    }
                  >
                    {ContactTypeSchema.options.map((type) => (
                      <option key={type} value={type}>
                        {t(`sell.contactTypes.${type}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {step === reviewStep && currentPhoto && (
              <div className="grid items-start gap-6 sm:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-black/10 bg-background/50 p-3 wrap-anywhere [&_article>div:first-child]:rounded-xl">
                  <ProductCard
                    product={{
                      title: formData.title.trim(),
                      price: formData.price,
                      size: sizeNames.join(", "),
                      city: cityNames.join(", "),
                      seller: t("common.seller"),
                      image: currentPhoto.url,
                    }}
                    isSaved={false}
                  />
                  {photos.length > 1 && (
                    <ul className="mt-3 flex gap-2 overflow-x-auto p-1">
                      {photos.map(({ file, url }) => (
                        <li key={url} className="shrink-0">
                          <button
                            type="button"
                            aria-label={file.name}
                            aria-pressed={currentPhoto.url === url}
                            onClick={() => setPreviewPhoto(url)}
                            className="h-12 w-12 overflow-hidden rounded-lg aria-pressed:ring-2 aria-pressed:ring-deep-accent"
                          >
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="min-w-0 space-y-4">
                  {formData.description?.trim() && (
                    <div>
                      <h3 className="text-sm font-bold">
                        {t("sell.description")}
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-black/65">
                        {formData.description.trim()}
                      </p>
                    </div>
                  )}
                  <dl className="divide-y divide-black/10 rounded-2xl border border-black/10 px-4">
                    {[
                      [
                        t("sell.mainCategory"),
                        [
                          selectedParent?.name,
                          selectedCategory?.id !== selectedParent?.id
                            ? selectedCategory?.name
                            : undefined,
                        ]
                          .filter(Boolean)
                          .join(" / "),
                      ],
                      [
                        t("sell.condition"),
                        t(`conditions.${formData.condition}.label`),
                      ],
                      [t("sell.quantity"), formData.quantity],
                      [
                        t("sell.contact"),
                        t(`sell.contactTypes.${formData.contactTypes[0]}`),
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-3 py-3 text-sm"
                      >
                        <dt className="text-black/60">{label}</dt>
                        <dd className="text-end font-bold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {step === reviewStep && (
              <p className="text-xs text-black/60">
                {t("sell.termsPrefix")}{" "}
                <a href="#" className="underline">{t("sell.termsLink")}</a>{" "}
                {t("sell.termsJoin")}{" "}
                <a href="#" className="underline">{t("sell.privacyLink")}</a>
                {t("sell.termsSuffix")}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {t(`sell.validation.${error}`)}
              </p>
            )}
          </section>

          <div className="flex items-center justify-between gap-3 border-t border-black/10 px-5 py-4 sm:px-8">
            {step > 0 ? (
              <Button onClick={() => moveTo(step - 1)} className={backClass}>
                {t("sell.back")}
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              loading={submitting}
              className={
                step === reviewStep
                  ? `${primaryClass} bg-accent hover:bg-accent/90`
                  : nextClass
              }
            >
              {submitting
                ? t("sell.submitting")
                : step === reviewStep
                  ? t("sell.submit")
                  : t("sell.next")}
            </Button>
          </div>
        </fieldset>
      </div>
    </form>
  )
}
