/**
 * Test Case: Data-driven OpenCart customer login
 *
 * Tags: @master @regression @datadriven @web
 */

import path from "node:path";
import { test, expect } from "../../fixtures/pageFixtures";
import { DataProvider } from "../../utils/DataReader";

type LoginDataRow = {
  testName: string;
  email: string;
  password: string;
  expected: "success" | "failure";
};

type RawLoginDataRow = {
  testName?: string;
  TestName?: string;
  email?: string;
  password?: string;
  expected?: string;
};

const loginDataPath = path.resolve(process.cwd(), "testdata", "opencart_logindata.csv");
const loginData: LoginDataRow[] = (DataProvider.readCsv(loginDataPath) as RawLoginDataRow[]).map(
  (row, index) => {
    const expected = row.expected?.trim().toLowerCase();
    if (expected !== "success" && expected !== "failure") {
      throw new Error(`Invalid expected result in login data row ${index + 1}: ${row.expected}`);
    }

    return {
      testName: row.testName?.trim() || row.TestName?.trim() || `Login data row ${index + 1}`,
      email: row.email ?? "",
      password: row.password ?? "",
      expected,
    };
  },
);

for (const [index, row] of loginData.entries()) {
  test(`${row.testName} data row ${index + 1} @master @regression @datadriven @web`, async ({
    homePage,
    loginPage,
    myAccountPage,
  }) => {
    await test.step("1) Open the customer login page", async () => {
      await homePage.clickLogin();
      expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step("2) Submit the values from the external data row", async () => {
      await loginPage.login(row.email, row.password);
    });

    if (row.expected === "success") {
      await test.step("3) Verify successful authentication and My Account", async () => {
        expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
      });
    } else if (!row.email.trim() || !row.password.trim()) {
      await test.step("3) Verify the application's response to blank credentials", async () => {
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        const fieldValues = await loginPage.getLoginFieldValues();
        expect(fieldValues.email).toBe(row.email.trim());
        expect(fieldValues.password).toBe(row.password.trim());

        const warning = await loginPage.getWarningMessageIfVisible();
        if (warning !== null) {
          expect(warning).toContain("Warning:");
        }
      });
    } else {
      await test.step("3) Verify the login failure and its warning", async () => {
        expect(await loginPage.getWarningMessage()).toContain("Warning:");
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
      });
    }

    console.log(`✅ Data-driven login row ${index + 1} completed successfully!`);
  });
}
