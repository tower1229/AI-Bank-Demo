import type { ApiResponse } from "../bank/types";

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

export function serverError(error: unknown): Response {
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
