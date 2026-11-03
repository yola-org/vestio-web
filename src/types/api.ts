export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface FieldValidationError {
  field: string;
  message: string;
  rejectedValue: unknown;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors: FieldValidationError[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  firstName: string;
  lastName: string;
}

export interface JwtResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  colors?: string[] | null;
  contactTypes: ContactType[];
  condition: Condition;
  status?: ListingStatus | null;
  quantity: number;
  cityIds: string[];
  categoryId: string;
  cityNames?: string[] | null;
  categoryName?: string | null;
  sizeIds?: string[] | null;
  sizeNames?: string[] | null;
  userId?: string | null;
}

export type ListingInput = Omit<Listing, 'id' | 'cityNames' | 'categoryName' | 'sizeNames' | 'userId'> & {
  id?: string;
};

export interface OnboardingStatus {
  accountCreated: boolean;
  additionalDataAdded: boolean;
  preferencesAdded: boolean;
  publishedSomething: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string;
  parentId?: string | null;
  sizeGroupId?: string | null;
  sizeGroup?: SizeGroup | null;
  subCategories?: Category[];
}

export interface CategoryGroup {
  title: string;
  items: string[];
}

export interface City {
  id: string;
  name: string;
}

export interface Size {
  id: string;
  name: string;
  categoryId?: string | null;
  sizeGroup?: string | null;
}

export interface SizeGroup {
  id: string;
  name: string;
  sizes: Size[];
}

export type Condition = 'NEW_WITH_TAG' | 'NEW_WITHOUT_TAG' | 'VERY_GOOD' | 'GOOD' | 'SATISFACTORY';

export type ContactType = 'WHATSAPP' | 'PHONE' | 'CHAT' | 'EMAIL';

export type ListingStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DELETED' | 'EXPIRED' | 'PENDING';

export interface StaticData {
  cities: City[];
  categories: Category[];
  conditions: Condition[];
  sizes: SizeGroup[];
  contactTypes: ContactType[];
  listingStatuses: ListingStatus[];
}

export interface UserPreferences {
  categoryIds: string[];
  gender: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  phoneNumber?: string | null;
  cityId?: string | null;
  cityName?: string | null;
  createdAt?: string;
}
