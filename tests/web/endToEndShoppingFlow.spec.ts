/**
 * Test Case: End-to-End Shopping Flow
 *
 * Tags: @master @sanity @regression @web @end-to-end
 *
 * Steps:
 * 1) Open the application.
 * 2) Register a customer with unique generated data.
 * 3) Verify registration and log out.
 * 4) Log in with the new credentials.
 * 5) Search for MacBook and validate its cart details.
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test("End-to-End Shopping Flow @master @sanity @regression @web @end-to-end", async ({
  page,
  homePage,
  registerPage,
  loginPage,
  myAccountPage,
}) => {
  const password = RandomDataUtil.getPassword(16);
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getEmail().replace("@", `+${Date.now()}@`),
    telephone: RandomDataUtil.getPhoneNumber(),
    password,
    confirmPassword: password,
  };
  const productDetails = Helper.getProductDetails();
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));

  await test.step("1) Open the application", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("2) Register a new customer with unique generated data", async () => {
    await homePage.clickRegister();
    await registerPage.completeRegistration(customer);
  });

  await test.step("3) Verify registration and account access", async () => {
    expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
    const accountPage = await registerPage.continueToAccount();
    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
  });

  await test.step("4) Log out", async () => {
    const logoutPage = await homePage.clickLogout();
    expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
    await logoutPage.continueToStore();
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step("5) Log in again with the newly created credentials", async () => {
    await homePage.clickLogin();
    await loginPage.login(customer.email, customer.password);
  });

  await test.step("6) Verify successful authentication", async () => {
    expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
  });

  const searchResultsPage = await test.step("7) Search for the known product", async () => {
    const resultsPage = await homePage.searchProduct(productDetails.productName);
    expect(await resultsPage.isSearchResultsPageExists()).toBeTruthy();
    expect(await resultsPage.isProductInResults(productDetails.productName)).toBeTruthy();
    return resultsPage;
  });

  const productPage = await test.step("8) Open the product details page", async () => {
    const detailsPage = await searchResultsPage.openProduct(productDetails.productName);
    expect(await detailsPage.isProductDetailsPageExists(productDetails.productName)).toBeTruthy();
    return detailsPage;
  });

  await test.step("9) Add the product to the cart", async () => {
    await productPage.setQuantity(productDetails.productQuantity);
    await productPage.addToCart();
  });

  const shoppingCartPage = await test.step("10) Open the shopping cart", async () => {
    const cartPage = await productPage.openShoppingCart();
    expect(await cartPage.isShoppingCartPageExists()).toBeTruthy();
    return cartPage;
  });

  await test.step("11) Verify the correct product is in the cart", async () => {
    expect(await shoppingCartPage.isProductInCart(productDetails.productName)).toBeTruthy();
  });

  await test.step("12) Verify the cart quantity", async () => {
    expect(await shoppingCartPage.getProductQuantity(productDetails.productName)).toBe(
      productDetails.productQuantity,
    );
  });

  await test.step("13) Verify the product price", async () => {
    expect(await shoppingCartPage.getProductPrice(productDetails.productName)).toBe(
      productDetails.totalPrice,
    );
  });

  await test.step("14) Verify the applicable cart total", async () => {
    expect(await shoppingCartPage.getCartTotal()).toBe(productDetails.totalPrice);
  });

  await test.step("15) Verify the complete journey finishes without errors", async () => {
    expect(pageErrors).toEqual([]);
  });

  console.log("✅ End-to-End Shopping Flow completed successfully!");
});
