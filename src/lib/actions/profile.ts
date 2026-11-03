'use server';

import { runAction, ActionResult } from '@/lib/api/action-result.ts';
import { request } from '@/lib/api/request.ts';
import { conditions, contactTypes } from '@/constants/data.ts';
import {
  Category,
  CategoryGroup,
  City,
  OnboardingStatus,
  StaticData,
  UserPreferences,
  UserProfile,
  Condition,
  ContactType,
  SizeGroup,
} from '@/types/api.ts';
import { categoriesToString } from '@/lib/category-utils';

export async function getStaticDataAction(): Promise<ActionResult<StaticData>> {
  return runAction(async () => {
    const [categories, cities, sizes] = await Promise.all([
      request<Category[]>('/api/categories', { next: { revalidate: 0 } }),
      request<City[]>('/api/cities', { next: { revalidate: 0 } }),
      request<SizeGroup[]>('/api/sizes', { next: { revalidate: 0 } }),
    ]);

    const data: StaticData = {
      categories,
      cities,
      sizes,
      conditions: conditions as unknown as Condition[],
      contactTypes: contactTypes as unknown as ContactType[],
      listingStatuses: [],
    };

    console.log('Static Data (Categories):\n', categoriesToString(data.categories));
    console.log('Raw Static Categories Payload:', JSON.stringify(data.categories, null, 2));
    console.log('Raw Static Sizes Payload:', JSON.stringify(data.sizes, null, 2));
    return data;
  });
}

export async function getProfileAction(): Promise<ActionResult<UserProfile>> {
  return runAction(async () => {
    const profile = await request<any>('/api/profile');
    return {
      ...profile,
      cityId: profile.city?.id || profile.cityId || null,
      cityName: profile.city?.name || profile.cityName || null,
    };
  });
}

export async function updateProfileAction(
  profile: Partial<UserProfile>
): Promise<ActionResult<UserProfile>> {
  const payload = {
    ...profile,
    city: profile.cityId ? { id: profile.cityId } : undefined
  };
  return runAction(() => request<UserProfile>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export async function getOnboardingStatusAction(): Promise<ActionResult<OnboardingStatus>> {
  return runAction(() => request<OnboardingStatus>('/api/profile/onboarding-status'));
}

export async function getPreferencesAction(): Promise<ActionResult<UserPreferences>> {
  return runAction(async () => {
    const prefs = await request<any>('/api/profile/preferences');
    
    // Normalize category IDs from backend (which might be objects or strings)
    const rawCategoryIds = prefs.categoryIds || prefs.categories || [];
    const normalizedCategoryIds = Array.isArray(rawCategoryIds)
      ? rawCategoryIds.map((c: any) => typeof c === 'object' ? String(c.id) : String(c))
      : [];
    
    return {
      categoryIds: normalizedCategoryIds,
      gender: prefs.gender || null
    };
  });
}

export async function updatePreferencesAction(
  preferences: UserPreferences
): Promise<ActionResult<null>> {
  const payload = {
    gender: preferences.gender,
    categoryIds: preferences.categoryIds,
    // The backend expects objects { id: UUID } for categories
    categories: (preferences.categoryIds || []).map(id => ({ id }))
  };

  return runAction(async () => {
    await request<void>('/api/profile/preferences', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return null;
  });
}

export async function getCategoriesAction(): Promise<ActionResult<Category[]>> {
  return runAction(async () => {
    const categories = await request<Category[]>('/api/categories', { next: { revalidate: 0 } });
    return categories;
  });
}

export async function getSizesAction(): Promise<ActionResult<SizeGroup[]>> {
  return runAction(async () => {
    const sizes = await request<SizeGroup[]>('/api/sizes', { next: { revalidate: 0 } });
    console.log('API Sizes Response (Size Groups):', sizes.length);
    sizes.forEach(g => console.log(`Group: ${g.name} (ID: ${g.id}), Sizes count: ${g.sizes.length}`));
    return sizes;
  });
}

export async function getCategoryGroupsAction(): Promise<ActionResult<CategoryGroup[]>> {
  return runAction(() => request<CategoryGroup[]>('/api/categories/groups', { next: { revalidate: 0 } }));
}

export async function getCitiesAction(): Promise<ActionResult<City[]>> {
  return runAction(() => request<City[]>('/api/cities', { next: { revalidate: 0 } }));
}
export async function getConditionsAction(): Promise<ActionResult<Condition[]>> {
  return runAction(async () => conditions as unknown as Condition[]);
}

export async function getContactTypesAction(): Promise<ActionResult<ContactType[]>> {
  return runAction(async () => contactTypes as unknown as ContactType[]);
}
