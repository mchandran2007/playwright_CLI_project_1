import { Locator, Page } from "@playwright/test";
import { MyAccountPage } from "./MyAccountPage";

export type RegistrationDetails = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  telephone?: string;
  confirmPassword?: string;
};

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly submitButton: Locator;
  private readonly continueLink: Locator;
  private readonly confirmationHeading: Locator;

  /**
   * Creates the registration page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.firstNameInput = page.getByRole("textbox", { name: "* First Name", exact: true });
    this.lastNameInput = page.getByRole("textbox", { name: "* Last Name", exact: true });
    this.emailInput = page.getByRole("textbox", { name: "* E-Mail", exact: true });
    this.telephoneInput = page.locator('input[name="telephone"]');
    this.passwordInput = page.getByRole("textbox", { name: "* Password", exact: true });
    this.confirmPasswordInput = page.locator('input[name="confirm"]');
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.submitButton = page.getByRole("button", { name: "Continue", exact: true });
    this.continueLink = page.getByRole("link", { name: "Continue", exact: true });
    this.confirmationHeading = page.getByRole("heading", {
      name: "Your Account Has Been Created!",
      exact: true,
    });
  }

  /**
   * Checks whether the customer registration form is displayed.
   * @returns Promise<boolean> - true when the first-name field is visible
   */
  async isRegisterPageExists(): Promise<boolean> {
    return this.firstNameInput.isVisible();
  }

  /**
   * Completes and submits the customer registration form.
   * @param customer - dynamically generated customer details
   */
  async completeRegistration(customer: RegistrationDetails): Promise<void> {
    try {
      await this.firstNameInput.fill(customer.firstName);
      await this.lastNameInput.fill(customer.lastName);
      await this.emailInput.fill(customer.email);
      if (customer.telephone && (await this.telephoneInput.count())) {
        await this.telephoneInput.fill(customer.telephone);
      }
      await this.passwordInput.fill(customer.password);
      if (customer.confirmPassword && (await this.confirmPasswordInput.count())) {
        await this.confirmPasswordInput.fill(customer.confirmPassword);
      }
      await this.privacyPolicyCheckbox.check();
      await this.submitButton.click();
    } catch (error) {
      console.log(`Customer registration failed: ${error}`);
      throw error;
    }
  }

  /**
   * Checks whether the account-created confirmation is displayed.
   * @returns Promise<boolean> - true when the confirmation is visible
   */
  async isAccountCreatedConfirmationVisible(): Promise<boolean> {
    await this.confirmationHeading.waitFor({ state: "visible" });
    return this.confirmationHeading.isVisible();
  }

  /**
   * Continues from registration confirmation to the account dashboard.
   * @returns Promise<MyAccountPage> - authenticated account dashboard page object
   */
  async continueToAccount(): Promise<MyAccountPage> {
    await this.continueLink.click();
    return new MyAccountPage(this.page);
  }
}
