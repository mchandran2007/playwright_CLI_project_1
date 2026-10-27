import { test, expect } from "../../fixtures/pageFixtures";
import dotenv from "dotenv";
import type { RowDataPacket } from "mysql2/promise";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";
import { executeQuery } from "../../utils/dbClient";

dotenv.config({ override: true });

const appHost = new URL(process.env.WEB_APP_URL ?? "http://localhost/").hostname;
const requiresLocalBackend = appHost === "localhost" || appHost === "127.0.0.1";

type CustomerRecord = RowDataPacket & {
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added: Date | string;
};

test("New customer registration is verified in Admin and MySQL @master @sanity @regression @web @db @end-to-end", async ({
  homePage,
  registerPage,
  adminCustomerPage,
}) => {
  test.skip(
    !requiresLocalBackend,
    "This test requires the local OpenCart admin portal and MySQL database.",
  );

  const password = RandomDataUtil.getPassword(16);
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getEmail().replace("@", `+${Date.now()}@`).toLowerCase(),
    telephone: RandomDataUtil.getPhoneNumber(),
    password,
    confirmPassword: password,
  };
  let registrationAttempted = false;

  try {
    await test.step("1) Register a unique customer through the storefront", async () => {
      await homePage.clickRegister();
      expect(await registerPage.isRegisterPageExists()).toBeTruthy();
      registrationAttempted = true;
      await registerPage.completeRegistration(customer);
      expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
    });

    await test.step("2) Find and validate the customer in the Admin Portal", async () => {
      const { username, password: adminPassword } = Helper.getAdminLoginDetails();
      await adminCustomerPage.login(username, adminPassword);
      await adminCustomerPage.openCustomers();

      const customerRow = await adminCustomerPage.searchCustomer(customer.email);
      await expect(customerRow, "The Admin customer list should contain the new customer").toHaveCount(
        1,
      );
      await expect(customerRow).toContainText(customer.firstName);
      await expect(customerRow).toContainText(customer.lastName);
      await expect(customerRow).toContainText(customer.email);

      await adminCustomerPage.openCustomerDetails(customerRow);
      await expect(adminCustomerPage.firstNameInput).toHaveValue(customer.firstName);
      await expect(adminCustomerPage.lastNameInput).toHaveValue(customer.lastName);
      await expect(adminCustomerPage.emailInput).toHaveValue(customer.email);
      await expect(adminCustomerPage.statusInput).toHaveValue("1");
    });

    await test.step("3) Verify the customer record in MySQL", async () => {
      const rows: CustomerRecord[] = await executeQuery(
        `SELECT firstname, lastname, email, status, date_added
         FROM oc_customer
         WHERE email = ?`,
        [customer.email],
      );

      expect(rows, "MySQL should return exactly one matching customer").toHaveLength(1);
      expect(rows[0].firstname, "The stored first name should match the registered customer").toBe(
        customer.firstName,
      );
      expect(rows[0].lastname, "The stored last name should match the registered customer").toBe(
        customer.lastName,
      );
      expect(rows[0].email, "The stored email should match the registered customer").toBe(
        customer.email,
      );
      expect(rows[0].status, "A newly registered customer should have enabled status").toBe(1);
      expect(rows[0].date_added, "The customer record should include its creation date").toBeTruthy();
    });
  } finally {
    if (registrationAttempted) {
      await executeQuery("DELETE FROM oc_customer WHERE email = ?", [customer.email]);
    }
  }
});
