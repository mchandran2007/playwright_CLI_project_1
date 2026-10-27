import type { APIResponse } from "@playwright/test";

export async function readOptionalJson(response: APIResponse): Promise<unknown | null> {
  const body = await response.text();
  return body.trim() ? (JSON.parse(body) as unknown) : null;
}
