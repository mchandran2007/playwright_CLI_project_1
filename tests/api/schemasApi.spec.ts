import Ajv from "ajv";
import { test, expect } from "@playwright/test";
import path from "node:path";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const CART_ID = Number(process.env.CART_ID ?? 1);
const ajv = new Ajv();

test.describe("FakeStore API Schema Validation", () => {
  test("GET - Validate product response schema @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID))}`,
    );
    expect(response.status(), "Fetching a product for schema validation should return HTTP 200").toBe(
      200,
    );

    const product: unknown = await response.json();
    const schema = DataProvider.readJson(
      path.resolve(process.cwd(), "api", "schemas", "product_api_schema.json"),
    );
    const validateProduct = ajv.compile(schema);
    const isValid = validateProduct(product);
    expect(
      isValid,
      `Product response should match its schema. Errors: ${JSON.stringify(validateProduct.errors)}`,
    ).toBeTruthy();
  });

  test("GET - Validate user response schema @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID))}`,
    );
    expect(response.status(), "Fetching a user for schema validation should return HTTP 200").toBe(
      200,
    );

    const user: unknown = await response.json();
    const schema = DataProvider.readJson(
      path.resolve(process.cwd(), "api", "schemas", "user_api_schema.json"),
    );
    const validateUser = ajv.compile(schema);
    const isValid = validateUser(user);
    expect(
      isValid,
      `User response should match its schema. Errors: ${JSON.stringify(validateUser.errors)}`,
    ).toBeTruthy();
  });

  test("GET - Validate cart response schema @master @sanity @api", async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}${Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID))}`,
    );
    expect(response.status(), "Fetching a cart for schema validation should return HTTP 200").toBe(
      200,
    );

    const cart: unknown = await response.json();
    const schema = DataProvider.readJson(
      path.resolve(process.cwd(), "api", "schemas", "cart_api_schema.json"),
    );
    const validateCart = ajv.compile(schema);
    const isValid = validateCart(cart);
    expect(
      isValid,
      `Cart response should match its schema. Errors: ${JSON.stringify(validateCart.errors)}`,
    ).toBeTruthy();
  });
});
