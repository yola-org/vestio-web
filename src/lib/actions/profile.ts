"use server"

/** Raw backend profile payload: UserProfile fields plus the nested city object. */

/** Raw backend preferences payload: category refs may be ids or nested objects. */

// Normalize category IDs from backend (which might be objects or strings)
// The backend expects objects { id: UUID } for categories

import { z } from "zod"

import { runAction, type ApiResult } from "@/lib/api/action-result.ts"
import { request } from "@/lib/api/request.ts"
import { conditions, contactTypes } from "@/constants/data.ts"
import type {
  Category,
  CategoryGroup,
  City,
  StaticData,
  UserPreferencesInput,
  UserProfile,
  Condition,
  ContactType,
  SizeGroup,
} from "@/lib/api/schemas"
import {
  ProfileUpdateInputSchema,
  UserPreferencesInputSchema,
  UserProfileSchema,
} from "@/lib/api/schemas"
import { parseInput } from "@/lib/api/validation"
const ProfileResponseSchema = UserProfileSchema.extend({
  city: z.object({ id: z.string(), name: z.string() }).nullish(),
})

type ProfileResponse = z.infer<typeof ProfileResponseSchema>
const CategoryRefSchema = z.union([z.string(), z.object({ id: z.string() })])

const PreferencesResponseSchema = z.object({
  gender: z.string().nullish(),
  categoryIds: z.array(CategoryRefSchema).nullish(),
  categories: z.array(CategoryRefSchema).nullish(),
})

type PreferencesResponse = z.infer<typeof PreferencesResponseSchema>

export async function getStaticDataAction(): Promise<ApiResult<StaticData>> {
  return runAction(async () => {
    const [categories, cities, sizes] = await Promise.all([
      request<Category[]>("/api/categories", {}, false),
      request<City[]>("/api/cities", {}, false),
      request<SizeGroup[]>("/api/sizes", {}, false),
    ])

    const data: StaticData = {
      categories,
      cities,
      sizes,
      conditions: [...conditions],
      contactTypes: [...contactTypes],
      listingStatuses: [],
    }

    return data
  })
}

export async function getProfileAction(): Promise<ApiResult<UserProfile>> {
  return runAction(async () => {
    const profile = await request<ProfileResponse>("/api/profile")
    return {
      ...profile,
      cityId: profile.city?.id || profile.cityId || null,
      cityName: profile.city?.name || profile.cityName || null,
    }
  })
}

export async function updateProfileAction(
  profile: Partial<UserProfile>,
): Promise<ApiResult<UserProfile>> {
  return runAction(() => {
    const input = parseInput(ProfileUpdateInputSchema, profile)
    return request<UserProfile>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        ...input,
        city: input.cityId ? { id: input.cityId } : undefined,
      }),
    })
  })
}

export async function getPreferencesAction(): Promise<ApiResult<UserPreferencesInput>> {
  return runAction(async () => {
    const prefs = await request<PreferencesResponse>("/api/profile/preferences")
    const rawCategoryIds = prefs.categoryIds || prefs.categories || []
    const normalizedCategoryIds = Array.isArray(rawCategoryIds)
      ? rawCategoryIds.map((c) =>
          typeof c === "object" ? String(c.id) : String(c),
        )
      : []

    return {
      categoryIds: normalizedCategoryIds,
      gender: prefs.gender || null,
    }
  })
}

export async function updatePreferencesAction(
  preferences: UserPreferencesInput,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    const input = parseInput(UserPreferencesInputSchema, preferences)
    const payload = {
      gender: input.gender,
      categoryIds: input.categoryIds,
      categories: input.categoryIds.map((id) => ({ id })),
    }
    await request<void>("/api/profile/preferences", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return null
  })
}

export async function getCategoriesAction(): Promise<ApiResult<Category[]>> {
  return runAction(async () => {
    const categories = await request<Category[]>("/api/categories", {}, false)
    return categories
  })
}

export async function getSizesAction(): Promise<ApiResult<SizeGroup[]>> {
  return runAction(async () => {
    const sizes = await request<SizeGroup[]>("/api/sizes", {}, false)
    return sizes
  })
}

export async function getCategoryGroupsAction(): Promise<ApiResult<CategoryGroup[]>> {
  return runAction(() =>
    request<CategoryGroup[]>("/api/categories/groups", {}, false),
  )
}

export async function getCitiesAction(): Promise<ApiResult<City[]>> {
  return runAction(() => request<City[]>("/api/cities", {}, false))
}
export async function getConditionsAction(): Promise<ApiResult<Condition[]>> {
  return runAction(async () => [...conditions])
}

export async function getContactTypesAction(): Promise<ApiResult<ContactType[]>> {
  return runAction(async () => [...contactTypes])
}
