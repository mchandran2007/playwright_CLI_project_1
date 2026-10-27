import { Locator, Page } from "@playwright/test";
import { LoginPage } from "./LoginPage";
import { LogoutPage } from "./LogoutPage";
import { RegisterPage } from "./RegisterPage";
import { SearchResultsPage } from "./SearchResultsPage";

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly featuredHeading: Locator;
  private readonly searchInput: Locator;

  /**
   * Creates the home page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.featuredHeading = page.getByRole("heading", { name: "Featured", exact: true });
    this.searchInput = page.getByRole("textbox", { name: "Search", exact: true });
  }

  /**
   * Checks whether the store home page is displayed.
   * @returns Promise<boolean> - true when the Featured section is visible
   */
  async isHomePageExists(): Promise<boolean> {
    return this.featuredHeading.isVisible();
  }

  /**
   * Checks whether the account menu is logged out.
   * @returns Promise<boolean> - true when login is available and logout is not
   */
  async isLoggedOut(): Promise<boolean> {
    await this.navigateToAccountRoute("account");
    return new LoginPage(this.page).isLoginPageExists();
  }

  /**
   * Opens the registration page from the account menu.
   * @returns Promise<RegisterPage> - registration page object
   */
  async clickRegister(): Promise<RegisterPage> {
    await this.navigateToAccountRoute("register");
    return new RegisterPage(this.page);
  }

  /**
   * Opens the login page from the account menu.
   * @returns Promise<LoginPage> - login page object
   */
  async clickLogin(): Promise<LoginPage> {
    await this.navigateToAccountRoute("login");
    return new LoginPage(this.page);
  }

  /**
   * Logs out through the account menu.
   * @returns Promise<LogoutPage> - logout confirmation page object
   */
  async clickLogout(): Promise<LogoutPage> {
    try {
      await this.navigateToAccountRoute("logout");
      return new LogoutPage(this.page);
    } catch (error) {
      console.log(`Unable to log out: ${error}`);
      throw error;
    }
  }

  /**
   * Searches the store for a product.
   * @param productName - product name to search for
   * @returns Promise<SearchResultsPage> - product search results page object
   */
  async searchProduct(productName: string): Promise<SearchResultsPage> {
    await this.searchInput.fill(productName);
    await this.searchInput.press("Enter");
    return new SearchResultsPage(this.page);
  }

  private async navigateToAccountRoute(route: string): Promise<void> {
    const accountUrl = new URL("index.php", this.page.url());
    accountUrl.searchParams.set("route", `account/${route}`);
    await this.page.goto(accountUrl.toString());
  }
}
