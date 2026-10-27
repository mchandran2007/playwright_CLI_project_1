import { Locator, Page } from "@playwright/test";
import { MyAccountPage } from "./MyAccountPage";

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly warningAlert: Locator;

  /**
   * Creates the login page object.
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.emailInput = page.getByRole("textbox", { name: "E-Mail Address", exact: true });
    this.passwordInput = page.getByRole("textbox", { name: "Password", exact: true });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.warningAlert = page.locator(".alert.alert-danger");
  }

  /**
   * Checks whether the returning-customer login form is displayed.
   * @returns Promise<boolean> - true when both login fields are visible
   */
  async isLoginPageExists(): Promise<boolean> {
    return (await this.emailInput.isVisible()) && this.passwordInput.isVisible();
  }

  /**
   * Submits the customer login form.
   * @param email - registered customer email
   * @param password - registered customer password
   * @returns Promise<MyAccountPage> - authenticated account dashboard page object
   */
  async login(email: string, password: string): Promise<MyAccountPage> {
    try {
      await this.emailInput.fill(email.trim());
      await this.passwordInput.fill(password.trim());
      await this.loginButton.click();
      return new MyAccountPage(this.page);
    } catch (error) {
      console.log(`Customer login failed: ${error}`);
      throw error;
    }
  }

  /**
   * Reads the login warning displayed after an unsuccessful attempt.
   * @returns Promise<string> - warning message text
   */
  async getWarningMessage(): Promise<string> {
    await this.warningAlert.waitFor({ state: "visible", timeout: 5000 });
    return this.warningAlert.innerText();
  }

  /**
   * Reads a login warning when the application displays one.
   * @returns Promise<string | null> - warning text or null when no warning is shown
   */
  async getWarningMessageIfVisible(): Promise<string | null> {
    if (!(await this.warningAlert.isVisible())) {
      return null;
    }
    return this.warningAlert.innerText();
  }

  /**
   * Reads the values currently displayed in the login form.
   * @returns Promise<{ email: string; password: string }> - login form values
   */
  async getLoginFieldValues(): Promise<{ email: string; password: string }> {
    return {
      email: await this.emailInput.inputValue(),
      password: await this.passwordInput.inputValue(),
    };
  }
}
