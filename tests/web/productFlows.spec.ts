/**
 * Test Cases: Product search and add product to cart
 *
 * Tags: @master @sanity @regression @web
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Product search flow @master @sanity @regression @web", async ({
  homePage,
}) => {
  const { productName } = Helper.getProductDetails();

  await test.step("1) Search for the configured known product", async () => {
    const searchResultsPage = await homePage.searchProduct(productName);
    expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
    expect(await searchResultsPage.isProductInResults(productName)).toBeTruthy();
  });

  console.log("✅ Product search flow completed successfully!");
});

test("Add product to cart @master @sanity @regression @web", async ({
  homePage,
}) => {
  const { productName, productQuantity } = Helper.getProductDetails();

  await test.step("1) Search for the configured product and open its details", async () => {
    const searchResultsPage = await homePage.searchProduct(productName);
    expect(await searchResultsPage.isProductInResults(productName)).toBeTruthy();
    const productPage = await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductDetailsPageExists(productName)).toBeTruthy();

    await test.step("2) Add the product with the requested quantity", async () => {
      await productPage.setQuantity(productQuantity);
      await productPage.addToCart();
      expect(await productPage.isProductAddedConfirmationVisible()).toBeTruthy();
    });

    await test.step("3) Verify the product and quantity in the shopping cart", async () => {
      const shoppingCartPage = await productPage.openShoppingCart();
      expect(await shoppingCartPage.isProductInCart(productName)).toBeTruthy();
      expect(await shoppingCartPage.getProductQuantity(productName)).toBe(productQuantity);
    });
  });

  console.log("✅ Add product to cart flow completed successfully!");
});
