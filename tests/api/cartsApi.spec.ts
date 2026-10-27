import { test, expect } from "@playwright/test";
import { Routes } from "../../api/endpoints/routes";
import { readOptionalJson } from "../../utils/apiResponse";

type Cart = {
  id: number;
  userId: number;
  date: string;
  products: Array<{ productId: number; quantity: number }>;
};

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const CART_ID = Number(process.env.CART_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const CART_LIMIT = Number(process.env.LIMIT ?? 3);
const START_DATE = process.env.START_DATE || "2019-12-10";
const END_DATE = process.env.END_DATE || "2020-10-10";

function sortedIds(ids: number[], order: "asc" | "desc"): boolean {
  return ids.every(
    (id, index) => index === 0 || (order === "asc" ? ids[index - 1] <= id : ids[index - 1] >= id),
  );
}

function isWithinDateRange(date: string, start: string, end: string): boolean {
  const cartDate = Date.parse(date);
  return cartDate >= Date.parse(start) && cartDate <= Date.parse(end);
}

test.describe("FakeStore Carts API Tests", () => {
  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), "Fetching carts should return HTTP 200").toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), "The carts response should be an array").toBeTruthy();
    expect(carts.length, "The carts response should not be empty").toBeGreaterThan(0);
  });

  test("GET - Cart by ID @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID))}`,
    );
    expect(response.status(), "Fetching a valid cart should return HTTP 200").toBe(200);

    const cart: Cart = await response.json();
    expect(cart.id, "The returned cart ID should match the request").toBe(CART_ID);
  });

  test("GET - Carts by date range @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE.replace(
      "{startdate}",
      encodeURIComponent(START_DATE),
    ).replace("{enddate}", encodeURIComponent(END_DATE));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), "Filtering carts by date should return HTTP 200").toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), "The date-filtered cart response should be an array").toBeTruthy();
    for (const cart of carts) {
      expect(
        isWithinDateRange(cart.date, START_DATE, END_DATE),
        `Cart ${cart.id} should have a date within the requested range`,
      ).toBeTruthy();
    }
  });

  test("GET - Carts for a user @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_USER_CART.replace("{userId}", String(USER_ID))}`,
    );
    expect(response.status(), "Fetching a user's carts should return HTTP 200").toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), "The user cart response should be an array").toBeTruthy();
    for (const cart of carts) {
      expect(cart.userId, "Each returned cart should belong to the requested user").toBe(USER_ID);
    }
  });

  test("GET - Carts with limit @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(CART_LIMIT))}`,
    );
    expect(response.status(), "A limited cart request should return HTTP 200").toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), "The limited carts response should be an array").toBeTruthy();
    expect(carts.length, "The API should return the requested number of carts").toBe(CART_LIMIT);
  });

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Carts sorted ${order} @master @regression @api`, async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}${Routes.GET_CARTS_SORTED.replace("{order}", order)}`,
      );
      expect(response.status(), `Sorting carts ${order} should return HTTP 200`).toBe(200);

      const carts: Cart[] = await response.json();
      expect(
        sortedIds(carts.map((cart) => cart.id), order),
        `Cart IDs should be sorted ${order}`,
      ).toBeTruthy();
    });
  }

  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const cart = {
      userId: USER_ID,
      date: START_DATE,
      products: [{ productId: PRODUCT_ID, quantity: 1 }],
    };
    const response = await request.post(`${API_BASE_URL}${Routes.CREATE_CART}`, { data: cart });

    expect(response.status(), "Creating a cart should return HTTP 201").toBe(201);
    const created: Cart = await response.json();
    expect(created.id, "The created cart should have an ID").toEqual(expect.any(Number));
    expect(created.userId).toBe(cart.userId);
    expect(created.products).toEqual(cart.products);
  });

  test("PUT - Update cart @master @regression @api", async ({ request }) => {
    const updatedCart = {
      userId: USER_ID,
      date: END_DATE,
      products: [{ productId: PRODUCT_ID, quantity: 2 }],
    };
    const response = await request.put(
      `${API_BASE_URL}${Routes.UPDATE_CART.replace("{id}", String(CART_ID))}`,
      { data: updatedCart },
    );

    expect(response.status(), "Updating a cart should return HTTP 200").toBe(200);
    const updated: Cart = await response.json();
    expect(updated.id).toBe(CART_ID);
    expect(updated.userId).toBe(updatedCart.userId);
    expect(updated.products[0].quantity).toBe(2);
  });

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const response = await request.delete(
      `${API_BASE_URL}${Routes.DELETE_CART.replace("{id}", String(CART_ID))}`,
    );
    expect(response.status(), "Deleting a cart should return HTTP 200").toBe(200);

    const deleted = await readOptionalJson(response);
    if (deleted !== null && typeof deleted === "object" && "id" in deleted) {
      expect(deleted.id, "A returned deleted cart ID should match the request").toBe(CART_ID);
    }
  });

  test("Cart CRUD workflow @master @regression @api @end-to-end", async ({ request }) => {
    const cart = {
      userId: USER_ID,
      date: START_DATE,
      products: [{ productId: PRODUCT_ID, quantity: 1 }],
    };
    let cartId = 0;

    await test.step("1) Create a cart and capture its ID", async () => {
      const response = await request.post(`${API_BASE_URL}${Routes.CREATE_CART}`, {
        data: cart,
      });
      expect(response.status(), "Cart creation should return HTTP 201").toBe(201);
      const created: Cart = await response.json();
      expect(created.id, "The created cart should include an ID").toEqual(expect.any(Number));
      expect(created.userId).toBe(USER_ID);
      expect(created.products).toEqual(cart.products);
      cartId = created.id;
    });

    const updatedCart = {
      userId: USER_ID,
      date: END_DATE,
      products: [{ productId: PRODUCT_ID, quantity: 2 }],
    };
    await test.step("2) Update the created cart quantity", async () => {
      const response = await request.put(
        `${API_BASE_URL}${Routes.UPDATE_CART.replace("{id}", String(cartId))}`,
        { data: updatedCart },
      );
      expect(response.status(), "Cart update should return HTTP 200").toBe(200);
      const updated: Cart = await response.json();
      expect(updated.id).toBe(cartId);
      expect(updated.userId).toBe(USER_ID);
      expect(updated.products[0].quantity).toBe(2);
    });

    await test.step("3) Delete the same cart", async () => {
      const response = await request.delete(
        `${API_BASE_URL}${Routes.DELETE_CART.replace("{id}", String(cartId))}`,
      );
      expect(response.status(), "Cart deletion should return HTTP 200").toBe(200);
      const deleted = await readOptionalJson(response);
      if (deleted !== null && typeof deleted === "object" && "id" in deleted) {
        expect(deleted.id).toBe(cartId);
      }
    });
  });
});
