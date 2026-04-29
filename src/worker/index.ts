import { handleApi } from "./api";
import { json } from "./http";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      return json(
        {
          ok: false,
          errorCode: "MCP_NOT_IMPLEMENTED",
          displayMessage: "The Bank MCP endpoint is reserved for Phase 2 and is not implemented yet."
        },
        { status: 501 }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
