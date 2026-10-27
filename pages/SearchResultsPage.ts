import { Locator, Page } from "@playwright/test";
import { ProductPage } from "./ProductPage";

export class SearchResultsPage {
  private readonly page: Page;

  // Locators
  private readonly resultsHeading: Locator;

  /**
   * Creates the product search results page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.resultsHeading = page.getByRole("heading", { name: /^Search - / });
  }

  /**
   * Checks whether the product appears in the search results.
   * @param productName - expected product name
   * @returns Promise<boolean> - true when the matching product link is visible
   */
  async isProductInResults(productName: string): Promise<boolean> {
    return this.getProductHeading(productName).isVisible();
  }

  /**
   * Opens a product from the search results.
   * @param productName - product name to open
   * @returns Promise<ProductPage> - product details page object
   */
  async openProduct(productName: string): Promise<ProductPage> {
    await this.getProductHeading(productName)
      .getByRole("link", { name: productName, exact: true })
      .click();
    return new ProductPage(this.page);
  }

  /**
   * Checks whether the search results page is displayed.
   * @returns Promise<boolean> - true when the search heading is visible
   */
  async isSearchResultsPageExists(): Promise<boolean> {
    return this.resultsHeading.isVisible();
  }

  private getProductHeading(productName: string): Locator {
    return this.page.getByRole("heading", { name: productName, exact: true });
  }
}
