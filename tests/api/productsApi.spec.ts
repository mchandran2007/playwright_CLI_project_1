import { test, expect } from "@playwright/test";
import { Routes } from "../../api/endpoints/routes";
import { readOptionalJson } from "../../utils/apiResponse";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
};

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const PRODUCT_LIMIT = Number(process.env.LIMIT ?? 3);

function productRoute(route: string, id = PRODUCT_ID): string {
  return route.replace("{id}", String(id));
}

function sortedIds(ids: number[], order: "asc" | "desc"): boolean {
  return ids.every((id, index) => index === 0 || (order === "asc" ? ids[index - 1] <= id : ids[index - 1] >= id));
}

test.describe("FakeStore Products API Tests", () => {
  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), "Fetching all products should return HTTP 200").toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), "The products response should be an array").toBeTruthy();
    expect(products.length, "The products response should not be empty").toBeGreaterThan(0);

    for (const product of products) {
      expect(product.id, "Each product should have a numeric ID").toEqual(expect.any(Number));
      expect(product.title, "Each product should have a title").toEqual(expect.any(String));
      expect(product.price, "Each product should have a numeric price").toEqual(expect.any(Number));
      expect(product.category, "Each product should have a category").toEqual(expect.any(String));
      expect(product.image, "Each product should have an image URL").toEqual(expect.any(String));
    }
  });

  test("GET - Product by ID @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${productRoute(Routes.GET_PRODUCT_BY_ID)}`,
    );
    expect(response.status(), "Fetching a valid product should return HTTP 200").toBe(200);

    const product: Product = await response.json();
    expect(product.id, "The returned product ID should match the requested ID").toBe(PRODUCT_ID);
    expect(product.title).toEqual(expect.any(String));
    expect(product.price).toEqual(expect.any(Number));
    expect(product.category).toEqual(expect.any(String));
    expect(product.image).toEqual(expect.any(String));
  });

  test("GET - Products with limit @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(PRODUCT_LIMIT))}`,
    );
    expect(response.status(), "A limited product request should return HTTP 200").toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), "The limited products response should be an array").toBeTruthy();
    expect(products.length, "The API should return the requested number of products").toBe(
      PRODUCT_LIMIT,
    );
  });

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Products sorted ${order} @master @regression @api`, async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace("{order}", order)}`,
      );
      expect(response.status(), `Sorting products ${order} should return HTTP 200`).toBe(200);

      const products: Product[] = await response.json();
      const ids = products.map((product) => product.id);
      expect(sortedIds(ids, order), `Product IDs should be sorted ${order}`).toBeTruthy();
    });
  }

  test("GET - All product categories @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), "Fetching categories should return HTTP 200").toBe(200);

    const categories: string[] = await response.json();
    expect(Array.isArray(categories), "The categories response should be an array").toBeTruthy();
    expect(categories.length, "The category list should not be empty").toBeGreaterThan(0);
  });

  test("GET - Products by category @master @sanity @api", async ({ request }) => {
    const category = "electronics";
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_PRODUCTS_BY_CATEGORY.replace(
        "{category}",
        encodeURIComponent(category),
      )}`,
    );
    expect(response.status(), "Fetching a valid category should return HTTP 200").toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), "The category response should be an array").toBeTruthy();
    for (const product of products) {
      expect(product.category, "Every product should match the requested category").toBe(category);
    }
  });

  test("POST - Create product @master @regression @api", async ({ request }) => {
    const product = {
      title: "Playwright API Product",
      price: 19.99,
      description: "Deterministic product payload for API testing",
      image: "https://i.pravatar.cc",
      category: "electronics",
    };
    const response = await request.post(`${API_BASE_URL}${Routes.CREATE_PRODUCT}`, { data: product });

    expect(response.status(), "Creating a product should return HTTP 201").toBe(201);
    const created: Product = await response.json();
    expect(created.id, "The created product should have an ID").toEqual(expect.any(Number));
    expect(created.title).toBe(product.title);
    expect(created.price).toBe(product.price);
    expect(created.description).toBe(product.description);
    expect(created.category).toBe(product.category);
    expect(created.image).toBe(product.image);
  });

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const updatedProduct = {
      title: "Playwright Updated Product",
      price: 29.99,
      description: "Updated deterministic product description",
      image: "https://i.pravatar.cc",
      category: "electronics",
    };
    const response = await request.put(
      `${API_BASE_URL}${productRoute(Routes.UPDATE_PRODUCT)}`,
      { data: updatedProduct },
    );

    expect(response.status(), "Updating a product should return HTTP 200").toBe(200);
    const updated: Product = await response.json();
    expect(updated.id, "The response ID should match the requested product").toBe(PRODUCT_ID);
    expect(updated.title).toBe(updatedProduct.title);
    expect(updated.price).toBe(updatedProduct.price);
    expect(updated.description).toBe(updatedProduct.description);
    expect(updated.category).toBe(updatedProduct.category);
    expect(updated.image).toBe(updatedProduct.image);
  });

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const response = await request.delete(
      `${API_BASE_URL}${productRoute(Routes.DELETE_PRODUCT)}`,
    );
    expect(response.status(), "Deleting a product should return HTTP 200").toBe(200);

    const deleted = await readOptionalJson(response);
    if (deleted !== null && typeof deleted === "object" && "id" in deleted) {
      expect(deleted.id, "A returned deleted product ID should match the request").toBe(PRODUCT_ID);
    }
  });

  test("Product CRUD workflow @master @regression @api @end-to-end", async ({ request }) => {
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
      const created: Product = await response.json();
      expect(created.id, "The created product should include an ID").toEqual(expect.any(Number));
      expect(created.title).toBe(product.title);
      expect(created.price).toBe(product.price);
      productId = created.id;
    });

    const updatedProduct = {
      ...product,
      title: "Playwright Workflow Product Updated",
      price: 42.5,
    };
    await test.step("2) Update the created product", async () => {
      const response = await request.put(
        `${API_BASE_URL}${Routes.UPDATE_PRODUCT.replace("{id}", String(productId))}`,
        { data: updatedProduct },
      );
      expect(response.status(), "Product update should return HTTP 200").toBe(200);
      const updated: Product = await response.json();
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
});
