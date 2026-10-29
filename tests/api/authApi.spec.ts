import { test, expect } from "@playwright/test";
import { Routes } from "../../api/endpoints/routes";

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const API_USERNAME = process.env.USERNAME;
const API_PASSWORD = process.env.PASSWORD;

test.describe("FakeStore Authentication API Tests", () => {
  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    expect(API_USERNAME, "USERNAME must be configured in .env").toBeTruthy();
    expect(API_PASSWORD, "PASSWORD must be configured in .env").toBeTruthy();

    const response = await request.post(`${API_BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: API_USERNAME, password: API_PASSWORD },
    });

    expect(response.status(), "Valid credentials should return HTTP 201").toBe(201);
      const responseBody: { token?: unknown } = await response.json();
    expect(typeof responseBody.token, "The response token should be a string").toBe("string");
    expect(
      (responseBody.token as string).length,
      "The response token should not be empty",
    ).toBeGreaterThan(0);
  });

  test("POST - Invalid login @master @regression @api", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: "invalid-user", password: "invalid-password" },
    });

    expect(response.status(), "Invalid credentials should return HTTP 401").toBe(401);

    const responseBody = await response.text();
    expect(responseBody, "The API should explain why authentication failed").toBe(
      "username or password is incorrect",
    );
  });
});
