import { z } from "zod"

export const FieldValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  rejectedValue: z.unknown(),
})

export const ApiErrorResponseSchema = z.object({
  timestamp: z.string(),
  status: z.number().int(),
  error: z.string(),
  message: z.string(),
  path: z.string(),
  validationErrors: z.array(FieldValidationErrorSchema),
})

export const LoginInputSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1),
})

export const SignupInputSchema = LoginInputSchema.extend({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
})

export const ProfileUpdateInputSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  bio: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  cityId: z.string().nullable().optional(),
})

export const UserPreferencesInputSchema = z.object({
  categoryIds: z.array(z.string()),
  gender: z.string().nullable(),
})

export const ConditionSchema = z.enum([
  "NEW_WITH_TAGS",
  "NEW_WITHOUT_TAGS",
  "VERY_GOOD",
  "GOOD",
  "SATISFACTORY",
])

export const ContactTypeSchema = z.enum(["MEETUP", "DELIVERY", "PARCEL"])

export const ListingStatusSchema = z.enum([
  "AVAILABLE",
  "SOLD",
  "AWAITING_ASSETS",
  "HIDDEN",
  "PENDING",
])

export const ListingInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  price: z.number().positive(),
  colors: z.array(z.string()).nullable().optional(),
  contactTypes: z.array(ContactTypeSchema).min(1),
  condition: ConditionSchema,
  status: ListingStatusSchema.nullable().optional(),
  quantity: z.number().int().min(1).max(2147483647),
  cityIds: z.array(z.uuid()).min(1),
  categoryId: z.uuid(),
  sizeIds: z.array(z.uuid()).nullable().optional(),
  gender: z.string().nullable().optional(),
  brandId: z.uuid().nullable().optional(),
})

export const CitySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const SizeSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string().nullish(),
  sizeGroup: z.string().nullish(),
})

export const SizeGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  sizes: z.array(SizeSchema),
})

/**
 * Recursive schema: TypeScript cannot infer a self-referential schema type,
 * so the output shape is declared once as an interface and the schema is
 * annotated with it (the zod-documented pattern). Everything else in this
 * file is derived with `z.infer`.
 */
export interface Category {
  id: string
  name: string
  description?: string | null
  image?: string
  parentId?: string | null
  sizeGroupId?: string | null
  sizeGroup?: SizeGroup | null
  subCategories?: Category[]
}

export const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    image: z.string().optional(),
    parentId: z.string().nullish(),
    sizeGroupId: z.string().nullish(),
    sizeGroup: SizeGroupSchema.nullish(),
    subCategories: z.array(CategorySchema).optional(),
  }),
)

export const CategoryGroupSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
})

export const ListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  price: z.number(),
  colors: z.array(z.string()).nullish(),
  contactTypes: z.array(ContactTypeSchema),
  condition: ConditionSchema,
  status: ListingStatusSchema.nullish(),
  quantity: z.number().int(),
  cityIds: z.array(z.string()),
  categoryId: z.string(),
  cityNames: z.array(z.string()).nullish(),
  categoryName: z.string().nullish(),
  sizeIds: z.array(z.string()).nullish(),
  sizeNames: z.array(z.string()).nullish(),
  userId: z.string().nullish(),
  assetKeys: z.array(z.uuid()).nullish(),
  gender: z.string().nullish(),
  brandId: z.uuid().nullish(),
})

export const JwtResponseSchema = z.object({
  accessToken: z.string(),
  idToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
  tokenType: z.string(),
})

export const OnboardingStatusSchema = z.object({
  accountCreated: z.boolean(),
  additionalDataAdded: z.boolean(),
  preferencesAdded: z.boolean(),
  publishedSomething: z.boolean(),
})

export const StaticDataSchema = z.object({
  cities: z.array(CitySchema),
  categories: z.array(CategorySchema),
  conditions: z.array(ConditionSchema),
  sizes: z.array(SizeGroupSchema),
  contactTypes: z.array(ContactTypeSchema),
  listingStatuses: z.array(ListingStatusSchema),
})

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  bio: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  cityId: z.string().nullish(),
  cityName: z.string().nullish(),
  createdAt: z.string().optional(),
})

export const paginatedResponseSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    content: z.array(item),
    totalPages: z.number().int(),
    totalElements: z.number().int(),
    size: z.number().int(),
    number: z.number().int(),
  })

export type PaginatedResponse<T,> = z.infer<ReturnType<typeof paginatedResponseSchema<z.ZodType<T>>>>

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>
export type FieldValidationError = z.infer<typeof FieldValidationErrorSchema>
export type LoginInput = z.infer<typeof LoginInputSchema>
export type SignupInput = z.infer<typeof SignupInputSchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>
export type UserPreferencesInput = z.infer<typeof UserPreferencesInputSchema>
export type ListingInput = z.infer<typeof ListingInputSchema>
export type Condition = z.infer<typeof ConditionSchema>
export type ContactType = z.infer<typeof ContactTypeSchema>
export type ListingStatus = z.infer<typeof ListingStatusSchema>
export type City = z.infer<typeof CitySchema>
export type Size = z.infer<typeof SizeSchema>
export type SizeGroup = z.infer<typeof SizeGroupSchema>
export type CategoryGroup = z.infer<typeof CategoryGroupSchema>
export type Listing = z.infer<typeof ListingSchema>
export type JwtResponse = z.infer<typeof JwtResponseSchema>
export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>
export type StaticData = z.infer<typeof StaticDataSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
