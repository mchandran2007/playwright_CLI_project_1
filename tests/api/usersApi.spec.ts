import { test, expect } from "@playwright/test";
import { Routes } from "../../api/endpoints/routes";
import { readOptionalJson } from "../../utils/apiResponse";

type User = {
  id: number;
  email: string;
  username: string;
  password: string;
  name: { firstname: string; lastname: string };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: { lat: string; long: string };
  };
  phone: string;
};

type UserUpdateResponse = Omit<User, "id">;
type CreatedUserResponse = { id: number };

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const USER_LIMIT = Number(process.env.LIMIT ?? 3);

function sortedIds(ids: number[], order: "asc" | "desc"): boolean {
  return ids.every(
    (id, index) => index === 0 || (order === "asc" ? ids[index - 1] <= id : ids[index - 1] >= id),
  );
}

test.describe("FakeStore Users API Tests", () => {
  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), "Fetching users should return HTTP 200").toBe(200);

    const users: User[] = await response.json();
    expect(Array.isArray(users), "The users response should be an array").toBeTruthy();
    expect(users.length, "The users response should not be empty").toBeGreaterThan(0);
  });

  test("GET - User by ID @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID))}`,
    );
    expect(response.status(), "Fetching a valid user should return HTTP 200").toBe(200);

    const user: User = await response.json();
    expect(user.id, "The returned user ID should match the requested ID").toBe(USER_ID);
  });

  test("GET - Users with limit @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(USER_LIMIT))}`,
    );
    expect(response.status(), "A limited user request should return HTTP 200").toBe(200);

    const users: User[] = await response.json();
    expect(Array.isArray(users), "The limited users response should be an array").toBeTruthy();
    expect(users.length, "The API should return the requested number of users").toBe(USER_LIMIT);
  });

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Users sorted ${order} @master @regression @api`, async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}${Routes.GET_USERS_SORTED.replace("{order}", order)}`,
      );
      expect(response.status(), `Sorting users ${order} should return HTTP 200`).toBe(200);

      const users: User[] = await response.json();
      expect(
        sortedIds(users.map((user) => user.id), order),
        `User IDs should be sorted ${order}`,
      ).toBeTruthy();
    });
  }

  test("POST - Create user @master @regression @api", async ({ request }) => {
    const user = {
      email: "playwright.api.user@example.com",
      username: "playwright-api-user",
      password: "PlaywrightPassword123",
      name: { firstname: "Playwright", lastname: "User" },
      address: {
        city: "Test City",
        street: "Test Street",
        number: 123,
        zipcode: "12345",
        geolocation: { lat: "0", long: "0" },
      },
      phone: "555-0100",
    };
    const response = await request.post(`${API_BASE_URL}${Routes.CREATE_USER}`, { data: user });

    expect(response.status(), "Creating a user should return HTTP 201").toBe(201);
    const created: CreatedUserResponse = await response.json();
    expect(created.id, "The created user should have an ID").toEqual(expect.any(Number));
  });

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const updatedUser = {
      email: "playwright.api.updated@example.com",
      username: "playwright-api-updated",
      password: "UpdatedPassword123",
      name: { firstname: "Updated", lastname: "Playwright" },
      address: {
        city: "Updated City",
        street: "Updated Street",
        number: 456,
        zipcode: "54321",
        geolocation: { lat: "1", long: "1" },
      },
      phone: "555-0101",
    };
    const response = await request.put(
      `${API_BASE_URL}${Routes.UPDATE_USER.replace("{id}", String(USER_ID))}`,
      { data: updatedUser },
    );

    expect(response.status(), "Updating a user should return HTTP 200").toBe(200);
    const updated: UserUpdateResponse = await response.json();
    expect(updated.email).toBe(updatedUser.email);
    expect(updated.username).toBe(updatedUser.username);
    expect(updated.name).toEqual(updatedUser.name);
    expect(updated.phone).toBe(updatedUser.phone);
  });

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const response = await request.delete(
      `${API_BASE_URL}${Routes.DELETE_USER.replace("{id}", String(USER_ID))}`,
    );
    expect(response.status(), "Deleting a user should return HTTP 200").toBe(200);

    const deleted = await readOptionalJson(response);
    if (deleted !== null && typeof deleted === "object" && "id" in deleted) {
      expect(deleted.id, "A returned deleted user ID should match the request").toBe(USER_ID);
    }
  });

  test("User CRUD workflow @master @regression @api @end-to-end", async ({ request }) => {
    const user = {
      email: "playwright.workflow.user@example.com",
      username: "playwright-workflow-user",
      password: "PlaywrightWorkflow123",
      name: { firstname: "Workflow", lastname: "User" },
      address: {
        city: "Workflow City",
        street: "Workflow Street",
        number: 789,
        zipcode: "67890",
        geolocation: { lat: "2", long: "2" },
      },
      phone: "555-0102",
    };
    let userId = 0;

    await test.step("1) Create the user and capture its ID", async () => {
      const response = await request.post(`${API_BASE_URL}${Routes.CREATE_USER}`, { data: user });
      expect(response.status(), "User creation should return HTTP 201").toBe(201);
      const created: CreatedUserResponse = await response.json();
      expect(created.id, "The created user should include an ID").toEqual(expect.any(Number));
      userId = created.id;
    });

    const updatedUser = {
      ...user,
      email: "playwright.workflow.updated@example.com",
      username: "playwright-workflow-updated",
      name: { firstname: "Updated", lastname: "Workflow" },
    };
    await test.step("2) Update the created user", async () => {
      const response = await request.put(
        `${API_BASE_URL}${Routes.UPDATE_USER.replace("{id}", String(userId))}`,
        { data: updatedUser },
      );
      expect(response.status(), "User update should return HTTP 200").toBe(200);
      const updated: UserUpdateResponse = await response.json();
      expect(updated.email).toBe(updatedUser.email);
      expect(updated.username).toBe(updatedUser.username);
      expect(updated.name).toEqual(updatedUser.name);
    });

    await test.step("3) Delete the same user", async () => {
      const response = await request.delete(
        `${API_BASE_URL}${Routes.DELETE_USER.replace("{id}", String(userId))}`,
      );
      expect(response.status(), "User deletion should return HTTP 200").toBe(200);
      const deleted = await readOptionalJson(response);
      if (deleted !== null && typeof deleted === "object" && "id" in deleted) {
        expect(deleted.id).toBe(userId);
      }
    });
  });
});
