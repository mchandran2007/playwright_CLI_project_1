import { Locator, Page } from "@playwright/test";

export class LogoutPage {
  private readonly page: Page;

  // Locators
  private readonly logoutHeading: Locator;
  private readonly continueButton: Locator;

  /**
   * Creates the logout confirmation page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.logoutHeading = page.getByRole("heading", { name: "Account Logout", exact: true });
    this.continueButton = page.getByRole("link", { name: "Continue", exact: true });
  }

  /**
   * Checks whether the logout confirmation is displayed.
   * @returns Promise<boolean> - true when the logout heading is visible
   */
  async isLogoutConfirmationVisible(): Promise<boolean> {
    return this.logoutHeading.isVisible();
  }

  /**
   * Continues from the logout confirmation page.
   */
  async continueToStore(): Promise<void> {
    await this.continueButton.click();
  }
}
