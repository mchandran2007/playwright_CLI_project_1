import { Locator, Page } from "@playwright/test";

export class ShoppingCartPage {
  private readonly page: Page;

  // Locators
  private readonly cartHeading: Locator;

  /**
   * Creates the shopping cart page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.cartHeading = page.getByRole("heading", { name: /^Shopping Cart/ });
  }

  /**
   * Checks whether the shopping cart page is displayed.
   * @returns Promise<boolean> - true when the cart heading is visible
   */
  async isShoppingCartPageExists(): Promise<boolean> {
    return this.cartHeading.isVisible();
  }

  /**
   * Checks whether the product appears as a cart line item.
   * @param productName - expected product name
   * @returns Promise<boolean> - true when the product's cart row is visible
   */
  async isProductInCart(productName: string): Promise<boolean> {
    return this.getProductRow(productName).isVisible();
  }

  /**
   * Reads the quantity currently shown for the cart line item.
   * @param productName - product name in the cart
   * @returns Promise<string> - displayed quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.getProductRow(productName).locator('input[name^="quantity"]').inputValue();
  }

  /**
   * Reads the product's unit price from the cart line item.
   * @param productName - product name in the cart
   * @returns Promise<string> - displayed unit price
   */
  async getProductPrice(productName: string): Promise<string> {
    return this.getProductRow(productName).getByRole("cell").nth(4).innerText();
  }

  /**
   * Reads the grand total from the cart summary.
   * @returns Promise<string> - displayed cart total
   */
  async getCartTotal(): Promise<string> {
    const totalRow = this.page
      .getByRole("row")
      .filter({ hasText: /Total:/ })
      .last();
    return totalRow.getByRole("cell").last().innerText();
  }

  private getProductRow(productName: string): Locator {
    return this.page.getByRole("row").filter({ hasText: productName });
  }
}
