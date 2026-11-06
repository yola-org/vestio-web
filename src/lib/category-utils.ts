import type { Category } from '@/lib/api/schemas';

/**
 * Converts a category and its subcategories into a formatted tree string.
 * @param category The root category to print.
 * @param indent The current indentation level.
 * @returns A string representation of the category hierarchy.
 */
export function categoryToString(category: Category, indent: number = 0): string {
  const spacing = '  '.repeat(indent);
  const sizeGroupId = category.sizeGroup?.id || category.sizeGroupId;
  let result = `${spacing}- ${category.name} (ID: ${category.id}, sizeGroupId: ${sizeGroupId})\n`;

  if (category.subCategories && category.subCategories.length > 0) {
    category.subCategories.forEach((child: any) => {
      result += categoryToString(child, indent + 1);
    });
  }

  return result;
}

/**
 * Converts an array of categories into a formatted tree string.
 * @param categories The array of categories to print.
 * @returns A string representation of the entire category hierarchy.
 */
export function categoriesToString(categories: Category[]): string {
  return categories.map(cat => categoryToString(cat)).join('\n');
}
