import { test as base } from "@playwright/test";
import dotenv from "dotenv";
import { HomePage } from "../pages/HomePage";
import { AdminCustomerPage } from "../pages/AdminCustomerPage";
import { LoginPage } from "../pages/LoginPage";
import { LogoutPage } from "../pages/LogoutPage";
import { MyAccountPage } from "../pages/MyAccountPage";
import { ProductPage } from "../pages/ProductPage";
import { RegisterPage } from "../pages/RegisterPage";
import { SearchResultsPage } from "../pages/SearchResultsPage";
import { ShoppingCartPage } from "../pages/ShoppingCartPage";

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

if (!APP_URL) {
  throw new Error("WEB_APP_URL must be configured in .env before running web tests.");
}

const ADMIN_URL = process.env.ADMIN_URL ?? new URL("admin/", APP_URL).toString();

type PageFixtures = {
  adminCustomerPage: AdminCustomerPage;
  homePage: HomePage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  myAccountPage: MyAccountPage;
  logoutPage: LogoutPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  shoppingCartPage: ShoppingCartPage;
};

export const test = base.extend<PageFixtures>({
  adminCustomerPage: async ({ context }, use) => {
    const page = await context.newPage();
    await use(new AdminCustomerPage(page, ADMIN_URL));
  },
  homePage: async ({ page }, use) => {
    await page.goto("./");
    await use(new HomePage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  myAccountPage: async ({ page }, use) => {
    await use(new MyAccountPage(page));
  },
  logoutPage: async ({ page }, use) => {
    await use(new LogoutPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  shoppingCartPage: async ({ page }, use) => {
    await use(new ShoppingCartPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }
  await context.close();
});

export { expect } from "@playwright/test";
