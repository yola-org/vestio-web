import {
  getCategoryGroupsAction,
  getStaticDataAction,
} from "@/lib/actions/profile"
import { conditions, contactTypes } from "@/constants/data"
import { cacheMetadata } from "./metadata-cache"
import type { ApiResult } from "./result"
import type { StaticData } from "./schemas"

const readStaticData = cacheMetadata(getStaticDataAction)
const readCategoryGroups = cacheMetadata(getCategoryGroupsAction)

// Keep the in-memory cache in the browser; server reads use Next's fetch cache.
const getStaticData = () =>
  typeof window === "undefined" ? getStaticDataAction() : readStaticData()

async function selectMetadata<K extends keyof StaticData>(
  key: K,
): Promise<ApiResult<StaticData[K]>> {
  const result = await getStaticData()
  return result.success ? { success: true, data: result.data[key] } : result
}

export const metadataApi = {
  getStaticData,
  getCategories: () => selectMetadata("categories"),
  getCities: () => selectMetadata("cities"),
  getSizes: () => selectMetadata("sizes"),
  getCategoryGroups: () =>
    typeof window === "undefined"
      ? getCategoryGroupsAction()
      : readCategoryGroups(),
  getConditions: async () => ({
    success: true as const,
    data: [...conditions],
  }),
  getContactTypes: async () => ({
    success: true as const,
    data: [...contactTypes],
  }),
}
