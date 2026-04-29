import type { ApiResponse } from "../bank/types";
import { BankServiceError } from "../bank/service";

export function json<T>(body: ApiResponse<T>, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init.headers
    }
  });
}

export function notFound(pathname: string): Response {
  return json(
    {
      ok: false,
      errorCode: "NOT_FOUND",
      displayMessage: `No route is registered for ${pathname}.`
    },
    { status: 404 }
  );
}

export function methodNotAllowed(method: string): Response {
  return json(
    {
      ok: false,
      errorCode: "METHOD_NOT_ALLOWED",
      displayMessage: `${method} is not allowed for this route.`
    },
    { status: 405 }
  );
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new BankServiceError("INVALID_JSON", "Request body must be valid JSON.");
  }
}

export function serverError(error: unknown): Response {
  if (error instanceof BankServiceError) {
    return json(
      {
        ok: false,
        errorCode: error.errorCode,
        displayMessage: error.message
      },
      { status: error.status }
    );
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  return json(
    {
      ok: false,
      errorCode: "INTERNAL_ERROR",
      displayMessage: message
    },
    { status: 500 }
  );
}
