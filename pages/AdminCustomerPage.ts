import { errors, Locator, Page } from "@playwright/test";

export class AdminCustomerPage {
  private readonly page: Page;
  private readonly adminUrl: string;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly loginWarning: Locator;
  private readonly dashboardHeading: Locator;
  private readonly customerMenu: Locator;
  private readonly customerListLink: Locator;
  private readonly emailFilter: Locator;
  private readonly filterButton: Locator;

  constructor(page: Page, adminUrl: string) {
    this.page = page;
    this.adminUrl = adminUrl;
    this.usernameInput = page.getByRole("textbox", { name: "Username", exact: true });
    this.passwordInput = page.getByRole("textbox", { name: "Password", exact: true });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.loginWarning = page.getByText("No match for Username and/or Password.", { exact: true });
    this.dashboardHeading = page.getByRole("heading", { name: "Dashboard", exact: true });
    this.customerMenu = page.locator("#menu-customer > a");
    this.customerListLink = page.locator(
      '#menu-customer a[href*="route=customer/customer&"]',
    );
    this.emailFilter = page.locator('#input-email, input[name="filter_email"]').first();
    this.filterButton = page.locator("#button-filter");
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.goto(this.adminUrl);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    let loginOutcome: "authenticated" | "rejected";
    try {
      loginOutcome = await Promise.race([
        this.dashboardHeading
          .waitFor({ state: "visible", timeout: 7000 })
          .then(() => "authenticated" as const),
        this.loginWarning
          .waitFor({ state: "visible", timeout: 7000 })
          .then(() => "rejected" as const),
      ]);
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        throw new Error(
          "Admin login did not reach the dashboard or report rejected credentials; verify the Admin login page and credentials in .env.",
        );
      }
      throw error;
    }

    if (loginOutcome === "rejected") {
      throw new Error("Admin login was rejected; verify ADMIN_USERNAME and ADMIN_PASSWORD in .env.");
    }
  }

  async openCustomers(): Promise<void> {
    await this.customerMenu.click();
    await this.customerListLink.click();
    await this.emailFilter.waitFor({ state: "visible" });
  }

  async searchCustomer(email: string): Promise<Locator> {
    await this.emailFilter.fill(email);
    await this.filterButton.click();
    const customerRow = this.page.locator("table tbody tr").filter({ hasText: email });
    await customerRow.waitFor({ state: "visible" });
    return customerRow;
  }

  async openCustomerDetails(customerRow: Locator): Promise<void> {
    await customerRow.locator('a[href*="route=customer/customer.form"]').click();
    await this.page.locator("#input-firstname").waitFor({ state: "visible" });
  }

  get firstNameInput(): Locator {
    return this.page.locator("#input-firstname");
  }

  get lastNameInput(): Locator {
    return this.page.locator("#input-lastname");
  }

  get emailInput(): Locator {
    return this.page.locator("#input-email");
  }

  get statusInput(): Locator {
    return this.page.locator("#input-status");
  }
}
