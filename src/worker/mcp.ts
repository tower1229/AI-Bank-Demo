import {
  createOnboardingApplication,
  createTransfer,
  getCustomerPortfolio,
  getOnboardingApplication,
  listProducts,
  purchaseProduct,
  searchCustomers,
  type CreateOnboardingApplicationInput,
  type CreateTransferInput,
  type OperationContext,
  type PurchaseProductInput
} from "../bank/service";

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

const mcpContext: OperationContext = {
  source: "telegram_openclaw",
  operatorId: "ai-bank-agent",
  operatorDisplayName: "AI Bank Agent"
};

const tools = [
  {
    name: "create_onboarding_application",
    description: "Submit a confirmed private banking onboarding application with structured identity fields and simulated KYC review for later web-console approval.",
    inputSchema: {
      type: "object",
      required: [
        "confirmed",
        "customerName",
        "documentCaptureMethod",
        "residentialAddress",
        "occupationTitle",
        "initialDepositCents",
        "currency",
        "sourceOfFunds",
        "isPep"
      ],
      properties: {
        confirmed: { type: "boolean" },
        customerName: { type: "string" },
        documentCaptureMethod: { type: "string", enum: ["image_parsed", "manual_text", "manual_upload"] },
        documentProvided: { type: "boolean" },
        documentType: { type: "string" },
        documentNumber: { type: "string" },
        documentExpiryDate: { type: "string" },
        dateOfBirth: { type: "string" },
        nationality: { type: "string" },
        residentialAddress: { type: "string" },
        occupationTitle: { type: "string" },
        initialDepositCents: { type: "integer" },
        currency: { type: "string", enum: ["USD"] },
        sourceOfFunds: { type: "string" },
        isPep: { type: "boolean" },
        originalUserText: { type: "string" },
        confirmationText: { type: "string" }
      }
    }
  },
  {
    name: "get_onboarding_application",
    description: "Load an onboarding application by id.",
    inputSchema: {
      type: "object",
      required: ["applicationId"],
      properties: {
        applicationId: { type: "string" }
      }
    }
  },
  {
    name: "search_customers",
    description: "Search active private banking customers and USD accounts.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" }
      }
    }
  },
  {
    name: "create_transfer",
    description: "Execute an internal USD account-to-account transfer after confirmation.",
    inputSchema: {
      type: "object",
      required: ["confirmed", "amountCents", "currency"],
      properties: {
        confirmed: { type: "boolean" },
        fromAccountId: { type: "string" },
        fromAccountNumber: { type: "string" },
        fromCustomerName: { type: "string" },
        toAccountId: { type: "string" },
        toAccountNumber: { type: "string" },
        toCustomerName: { type: "string" },
        amountCents: { type: "integer" },
        currency: { type: "string", enum: ["USD"] },
        memo: { type: "string" },
        originalUserText: { type: "string" },
        confirmationText: { type: "string" }
      }
    }
  },
  {
    name: "list_products",
    description: "List active investment products.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "purchase_product",
    description: "Purchase an active investment product from a USD account after confirmation.",
    inputSchema: {
      type: "object",
      required: ["confirmed", "productId", "amountCents", "currency"],
      properties: {
        confirmed: { type: "boolean" },
        accountId: { type: "string" },
        accountNumber: { type: "string" },
        customerName: { type: "string" },
        productId: { type: "string" },
        amountCents: { type: "integer" },
        currency: { type: "string", enum: ["USD"] },
        riskMismatchAcknowledged: { type: "boolean" },
        originalUserText: { type: "string" },
        confirmationText: { type: "string" }
      }
    }
  },
  {
    name: "get_customer_portfolio",
    description: "Load customer accounts, balances, holdings, and recent transactions.",
    inputSchema: {
      type: "object",
      required: ["customerId"],
      properties: {
        customerId: { type: "string" }
      }
    }
  }
];

export async function handleMcp(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") {
    return rpcResponse(null, { tools });
  }

  if (request.method !== "POST") {
    return rpcError(null, -32600, `${request.method} is not allowed for /mcp.`, 405);
  }

  let payload: JsonRpcRequest;
  try {
    payload = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Request body must be valid JSON.", 400);
  }

  try {
    if (payload.method === "initialize") {
      return rpcResponse(payload.id ?? null, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "core-bank-system", version: "0.1.0" }
      });
    }

    if (payload.method === "tools/list") {
      return rpcResponse(payload.id ?? null, { tools });
    }

    if (payload.method === "tools/call") {
      return rpcResponse(payload.id ?? null, await callTool(env.DB, payload.params?.name, payload.params?.arguments ?? {}));
    }

    return rpcError(payload.id ?? null, -32601, `Unsupported MCP method: ${payload.method ?? "missing"}`, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown MCP error";
    const code = error instanceof Error && "errorCode" in error ? String(error.errorCode) : "INTERNAL_ERROR";

    return rpcResponse(payload.id ?? null, {
      content: [{ type: "text", text: message }],
      isError: true,
      structuredContent: {
        ok: false,
        errorCode: code,
        displayMessage: message
      }
    });
  }
}

async function callTool(db: D1Database, name: string | undefined, args: Record<string, unknown>): Promise<unknown> {
  if (!name) {
    throw new Error("Tool name is required.");
  }

  if (name === "create_onboarding_application") {
    const input = args as unknown as CreateOnboardingApplicationInput & McpMetaArgs;
    const result = await createOnboardingApplication(db, input, contextFromArgs(input));
    return toolResult(result.displayMessage, result.application);
  }

  if (name === "get_onboarding_application") {
    const application = await getOnboardingApplication(db, requireString(args.applicationId, "applicationId"));
    return toolResult("Onboarding application loaded.", application);
  }

  if (name === "search_customers") {
    const customers = await searchCustomers(db, typeof args.query === "string" ? args.query : "");
    return toolResult("Customers loaded.", customers);
  }

  if (name === "create_transfer") {
    const input = args as unknown as CreateTransferInput & McpMetaArgs;
    const result = await createTransfer(db, input, contextFromArgs(input));
    return toolResult(result.displayMessage, result);
  }

  if (name === "list_products") {
    const products = await listProducts(db);
    return toolResult("Products loaded.", products);
  }

  if (name === "purchase_product") {
    const input = args as unknown as PurchaseProductInput & McpMetaArgs;
    const result = await purchaseProduct(db, input, contextFromArgs(input));
    return toolResult(result.displayMessage, result);
  }

  if (name === "get_customer_portfolio") {
    const portfolio = await getCustomerPortfolio(db, requireString(args.customerId, "customerId"));
    return toolResult("Customer portfolio loaded.", portfolio);
  }

  throw new Error(`Unknown tool: ${name}`);
}

interface McpMetaArgs {
  originalUserText?: string;
  confirmationText?: string;
}

function contextFromArgs(args: McpMetaArgs): OperationContext {
  return {
    ...mcpContext,
    originalUserText: args.originalUserText,
    confirmationText: args.confirmationText
  };
}

function toolResult(displayMessage: string, data: unknown): unknown {
  const structuredContent = {
    ok: true,
    data,
    displayMessage
  };

  return {
    content: [{ type: "text", text: displayMessage }],
    structuredContent
  };
}

function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }

  return value;
}

function rpcResponse(id: string | number | null, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function rpcError(id: string | number | null, code: number, message: string, status = 400): Response {
  return new Response(
    JSON.stringify(
      {
        jsonrpc: "2.0",
        id,
        error: { code, message }
      },
      null,
      2
    ),
    {
      status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    }
  );
}
