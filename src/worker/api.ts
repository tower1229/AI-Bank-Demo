import { getDashboard, getHealth, getSeedStatus } from "../bank/dashboard";
import { json, methodNotAllowed, notFound, serverError } from "./http";

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return methodNotAllowed(request.method);
  }

  try {
    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        data: await getHealth(env.DB),
        displayMessage: "Core Bank System API and D1 are reachable."
      });
    }

    if (url.pathname === "/api/seed/status") {
      const seedStatus = await getSeedStatus(env.DB);

      return json({
        ok: true,
        data: seedStatus,
        displayMessage: seedStatus.seeded
          ? "Seed data is available."
          : "Seed data is missing or incomplete."
      });
    }

    if (url.pathname === "/api/dashboard") {
      return json({
        ok: true,
        data: await getDashboard(env.DB),
        displayMessage: "Dashboard data loaded."
      });
    }

    return notFound(url.pathname);
  } catch (error) {
    return serverError(error);
  }
}
