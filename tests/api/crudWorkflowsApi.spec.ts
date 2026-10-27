import { test, expect } from "@playwright/test";
import { Routes } from "../../api/endpoints/routes";
import { readOptionalJson } from "../../utils/apiResponse";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

type UserResponse = {
  email: string;
  username: string;
  name: { firstname: string; lastname: string };
};

type CreatedUserResponse = { id: number };

type CartResponse = {
  id: number;
  userId: number;
  products: Array<{ productId: number; quantity: number }>;
};

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const CART_DATE = process.env.START_DATE || "2019-12-10";

test.describe("FakeStore CRUD API Workflows", () => {
  test("Product create-update-delete workflow @master @regression @api @end-to-end", async ({
    request,
  }) => {
    const product = {
      title: "Playwright Workflow Product",
      price: 31.25,
      description: "Deterministic product payload for the CRUD workflow",
      image: "https://i.pravatar.cc",
      category: "electronics",
    };
    let productId = 0;

    await test.step("1) Create a product and capture its ID", async () => {
      const response = await request.post(`${API_BASE_URL}${Routes.CREATE_PRODUCT}`, {
        data: product,
      });
      expect(response.status(), "Product creation should return HTTP 201").toBe(201);
      const created: ProductResponse = await response.json();
      expect(created.id, "The create response should include a product ID").toEqual(
        expect.any(Number),
      );
      expect(created.title).toBe(product.title);
      expect(created.price).toBe(product.price);
      productId = created.id;
    });

    const updatedProduct = {
      ...product,
      title: "Playwright Workflow Product Updated",
      price: 42.5,
    };
    await test.step("2) Update the same product", async () => {
      const response = await request.put(
        `${API_BASE_URL}${Routes.UPDATE_PRODUCT.replace("{id}", String(productId))}`,
        { data: updatedProduct },
      );
      expect(response.status(), "Product update should return HTTP 200").toBe(200);
      const updated: ProductResponse = await response.json();
      expect(updated.id).toBe(productId);
      expect(updated.title).toBe(updatedProduct.title);
      expect(updated.price).toBe(updatedProduct.price);
    });

    await test.step("3) Delete the same product", async () => {
      const response = await request.delete(
        `${API_BASE_URL}${Routes.DELETE_PRODUCT.replace("{id}", String(productId))}`,
      );
      expect(response.status(), "Product deletion should return HTTP 200").toBe(200);
      const deleted = await readOptionalJson(response);
      if (deleted !== null && typeof deleted === "object" && "id" in deleted) {
        expect(deleted.id).toBe(productId);
      }
    });
  });

  test("User create-update-delete workflow @master @regression @api @end-to-end", async ({
    request,
  }) => {
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

    await test.step("1) Create a user and capture its ID", async () => {
      const response = await request.post(`${API_BASE_URL}${Routes.CREATE_USER}`, { data: user });
      expect(response.status(), "User creation should return HTTP 201").toBe(201);
      const created: CreatedUserResponse = await response.json();
      expect(created.id, "The create response should include a user ID").toEqual(
        expect.any(Number),
      );
      userId = created.id;
    });

    const updatedUser = {
      ...user,
      email: "playwright.workflow.updated@example.com",
      username: "playwright-workflow-updated",
      name: { firstname: "Updated", lastname: "Workflow" },
    };
    await test.step("2) Update the same user", async () => {
      const response = await request.put(
        `${API_BASE_URL}${Routes.UPDATE_USER.replace("{id}", String(userId))}`,
        { data: updatedUser },
      );
      expect(response.status(), "User update should return HTTP 200").toBe(200);
      const updated: UserResponse = await response.json();
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

  test("Cart create-update-delete workflow @master @regression @api @end-to-end", async ({
    request,
  }) => {
    const cart = {
      userId: USER_ID,
      date: CART_DATE,
      products: [{ productId: PRODUCT_ID, quantity: 1 }],
    };
    let cartId = 0;

    await test.step("1) Create a cart and capture its ID", async () => {
      const response = await request.post(`${API_BASE_URL}${Routes.CREATE_CART}`, {
        data: cart,
      });
      expect(response.status(), "Cart creation should return HTTP 201").toBe(201);
      const created: CartResponse = await response.json();
      expect(created.id, "The create response should include a cart ID").toEqual(expect.any(Number));
      expect(created.userId).toBe(USER_ID);
      expect(created.products).toEqual(cart.products);
      cartId = created.id;
    });

    const updatedCart = {
      ...cart,
      products: [{ productId: PRODUCT_ID, quantity: 2 }],
    };
    await test.step("2) Update the same cart quantity", async () => {
      const response = await request.put(
        `${API_BASE_URL}${Routes.UPDATE_CART.replace("{id}", String(cartId))}`,
        { data: updatedCart },
      );
      expect(response.status(), "Cart update should return HTTP 200").toBe(200);
      const updated: CartResponse = await response.json();
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
