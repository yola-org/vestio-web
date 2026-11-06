import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly categoriesButton: Locator;
  readonly userMenuButton: Locator;
  readonly languageSwitcher: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoriesButton = page.locator('button:has-text("TOUTES"), button:has-text("Toutes"), button:has-text("All")').first();
    this.userMenuButton = page.locator('[aria-haspopup="true"]').filter({ has: page.locator('img, svg') }).first();
    this.languageSwitcher = page.locator('button').filter({ hasText: /FR|AR/ }).first();
  }

  async openCategoriesDropdown() {
    await this.categoriesButton.click();
  }

  async openUserDropdown() {
    await this.userMenuButton.click();
  }

  async openPreferencesModal() {
    await this.openUserDropdown();
    await this.page.locator('button:has-text("Préférences"), button:has-text("Preferences")').click();
  }
}
