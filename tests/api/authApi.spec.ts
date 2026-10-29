import { test, expect } from "@playwright/test";
import { Routes } from "../../api/endpoints/routes";

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;

test.describe("FakeStore Authentication API Tests", () => {
  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    expect(API_USERNAME, "API_USERNAME must be configured in .env").toBeTruthy();
    expect(API_PASSWORD, "API_PASSWORD must be configured in .env").toBeTruthy();
    
    console.log("Testing login with username:", API_USERNAME);
    console.log("Testing login with password:", API_PASSWORD);
    const response = await request.post(`${API_BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: API_USERNAME, password: API_PASSWORD },
    });

    console.log("Response status:", response.statusText());
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
