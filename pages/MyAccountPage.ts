import { Locator, Page } from "@playwright/test";

export class MyAccountPage {
  private readonly page: Page;

  // Locators
  private readonly accountHeading: Locator;

  /**
   * Creates the account dashboard page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountHeading = page
      .locator("#content")
      .getByRole("heading", { name: "My Account", exact: true });
  }

  /**
   * Checks whether the authenticated account dashboard is displayed.
   * @returns Promise<boolean> - true when the account heading is visible
   */
  async isMyAccountPageExists(): Promise<boolean> {
    await this.accountHeading.waitFor({ state: "visible", timeout: 5000 });
    return this.accountHeading.isVisible();
  }
}
