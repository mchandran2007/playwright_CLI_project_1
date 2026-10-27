/**
 * Test Cases: Customer registration, login, invalid login, and logout
 *
 * Tags: @master @sanity @regression @web
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test("Customer registration flow @master @sanity @regression @web", async ({
  homePage,
  registerPage,
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

  await test.step("1) Open the registration page from My Account", async () => {
    await homePage.clickRegister();
    expect(await registerPage.isRegisterPageExists()).toBeTruthy();
  });

  await test.step("2) Register the dynamically generated customer", async () => {
    await registerPage.completeRegistration(customer);
    expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
  });

  await test.step("3) Verify the new account is available in account navigation", async () => {
    const myAccountPage = await registerPage.continueToAccount();
    expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
  });

  console.log("✅ Customer registration flow completed successfully!");
});

test("Valid customer login flow @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  myAccountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step("1) Navigate to the customer login page", async () => {
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  await test.step("2) Log in with configured customer credentials", async () => {
    await loginPage.login(email, password);
  });

  await test.step("3) Verify the authenticated My Account dashboard", async () => {
    expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
  });

  console.log("✅ Valid customer login flow completed successfully!");
});

test("Invalid customer login flow @master @sanity @regression @web", async ({
  homePage,
  loginPage,
}) => {
  await test.step("1) Navigate to the customer login page", async () => {
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  await test.step("2) Submit invalid customer credentials", async () => {
    await loginPage.login(`invalid-${Date.now()}@example.com`, RandomDataUtil.getPassword());
  });

  await test.step("3) Verify authentication is rejected with the expected warning", async () => {
    expect(await loginPage.getWarningMessage()).toContain(
      "Warning: No match for E-Mail Address and/or Password.",
    );
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  console.log("✅ Invalid customer login flow completed successfully!");
});

test("Customer logout flow @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  myAccountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step("1) Log in with configured customer credentials", async () => {
    await homePage.clickLogin();
    await loginPage.login(email, password);
    expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
  });

  await test.step("2) Log out and verify the confirmation page", async () => {
    const logoutPage = await homePage.clickLogout();
    expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
    await logoutPage.continueToStore();
  });

  await test.step("3) Verify the store returns to logged-out account navigation", async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
    expect(await homePage.isLoggedOut()).toBeTruthy();
  });

  console.log("✅ Customer logout flow completed successfully!");
});
