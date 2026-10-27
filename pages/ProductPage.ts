import { expect, Locator, Page } from "@playwright/test";
import { ShoppingCartPage } from "./ShoppingCartPage";

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly addToCartSuccessAlert: Locator;

  /**
   * Creates the product details page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.quantityInput = page.locator('input[name="quantity"]');
    this.addToCartButton = page.getByRole("button", { name: "Add to Cart", exact: true });
    this.shoppingCartLink = page.getByRole("link", { name: /Shopping Cart/ });
    this.addToCartSuccessAlert = page.locator("#alert, .alert-success").first();
  }

  /**
   * Checks whether the requested product details page is displayed.
   * @param productName - expected product name
   * @returns Promise<boolean> - true when the product heading is visible
   */
  async isProductDetailsPageExists(productName: string): Promise<boolean> {
    const productHeading = this.page.getByRole("heading", { name: productName, exact: true });
    await productHeading.waitFor({ state: "visible" });
    return productHeading.isVisible();
  }

  /**
   * Sets the requested product quantity.
   * @param quantity - quantity to add to the cart
   */
  async setQuantity(quantity: string): Promise<void> {
    await this.quantityInput.fill(quantity);
  }

  /**
   * Adds the displayed product to the shopping cart.
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Checks whether the store confirms that the product was added.
   * @returns Promise<boolean> - true when the success alert is visible
   */
  async isProductAddedConfirmationVisible(): Promise<boolean> {
    await this.page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => undefined);
    await expect(this.addToCartSuccessAlert).toContainText(/success: you have added .* to your shopping cart!/i, {
      timeout: 20000,
    });
    return this.addToCartSuccessAlert.isVisible();
  }

  /**
   * Opens the shopping cart.
   * @returns Promise<ShoppingCartPage> - shopping cart page object
   */
  async openShoppingCart(): Promise<ShoppingCartPage> {
    await this.shoppingCartLink.click();
    return new ShoppingCartPage(this.page);
  }
}
