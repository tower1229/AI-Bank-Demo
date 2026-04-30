import { describe, expect, it } from "vitest";
import { handleApi } from "./api";
import { handleMcp } from "./mcp";

type JsonObject = Record<string, any>;

class SmokeD1 {
  application: JsonObject | null = null;

  prepare(sql: string) {
    return {
      ...query(sql, this),
      bind: (...args: unknown[]) => query(sql, this, args)
    };
  }

  async batch(statements: Array<{ run?: () => Promise<unknown> }>) {
    return Promise.all(statements.map((statement) => statement.run?.() ?? { success: true }));
  }
}

const env = { DB: new SmokeD1() as unknown as D1Database } as Env;

describe("worker API smoke", () => {
  it("lists payment instructions", async () => {
    const response = await handleApi(new Request("http://local.test/api/transfers"), env);
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.displayMessage).toBe("Payment instructions loaded.");
    expect(body.data).toEqual([
      expect.objectContaining({
        id: "tx-smoke-transfer",
        fromAccountNumber: "PB-USD-1001",
        toAccountNumber: "PB-USD-2002",
        amountCents: 2500000
      })
    ]);
  });

  it("rejects transfer writes without confirmation", async () => {
    const response = await handleApi(
      new Request("http://local.test/api/transfers", {
        method: "POST",
        body: JSON.stringify({
          confirmed: false,
          fromAccountNumber: "PB-USD-1001",
          toAccountNumber: "PB-USD-2002",
          amountCents: 2500000,
          currency: "USD"
        })
      }),
      env
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.errorCode).toBe("CONFIRMATION_REQUIRED");
  });

  it("lists products", async () => {
    const response = await handleApi(new Request("http://local.test/api/products"), env);
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: "product-smoke-cash",
        name: "USD Cash Plus",
        minimumSubscriptionCents: 1000000
      })
    ]);
  });

  it("deletes customer demo data", async () => {
    const response = await handleApi(
      new Request("http://local.test/api/customers/customer-smoke", {
        method: "DELETE",
        body: JSON.stringify({ confirmed: true })
      }),
      newEnv()
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toMatchObject({
      customerId: "customer-smoke",
      customerName: "Smoke Client",
      deleted: {
        applications: 1,
        accounts: 1,
        holdings: 1,
        transactions: 1
      }
    });
    expect(body.displayMessage).toContain("demo client data was deleted");
  });

  it("resets demo data to seed state", async () => {
    const response = await handleApi(
      new Request("http://local.test/api/demo/reset", {
        method: "POST",
        body: JSON.stringify({ confirmed: true })
      }),
      newEnv()
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.counts).toMatchObject({
      customers: 3,
      accounts: 3,
      products: 3,
      holdings: 2,
      transactions: 5,
      onboardingApplications: 1,
      auditLogs: 2
    });
    expect(body.displayMessage).toBe("Demo data has been reset to the seeded baseline.");
  });
});

describe("MCP smoke", () => {
  it("exposes expected unauthenticated tools and no approval tool", async () => {
    const response = await handleMcp(new Request("http://local.test/mcp"), env);
    const body = (await response.json()) as JsonObject;
    const toolNames = body.result.tools.map((tool: { name: string }) => tool.name);

    expect(response.status).toBe(200);
    expect(toolNames).toEqual(
      expect.arrayContaining([
        "create_onboarding_application",
        "get_onboarding_application",
        "search_customers",
        "create_transfer",
        "list_products",
        "purchase_product",
        "get_customer_portfolio"
      ])
    );
    expect(toolNames).not.toContain("approve_onboarding_application");
  });

  it("supports JSON-RPC tools/list", async () => {
    const response = await handleMcp(
      new Request("http://local.test/mcp", {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })
      }),
      env
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.id).toBe(1);
    expect(body.result.tools.length).toBeGreaterThan(0);
  });

  it("returns stable displayMessage for rejected tool calls", async () => {
    const response = await handleMcp(
      new Request("http://local.test/mcp", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "transfer-1",
          method: "tools/call",
          params: {
            name: "create_transfer",
            arguments: {
              confirmed: false,
              fromAccountNumber: "PB-USD-1001",
              toAccountNumber: "PB-USD-2002",
              amountCents: 2500000,
              currency: "USD"
            }
          }
        })
      }),
      env
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.result.structuredContent).toMatchObject({
      ok: false,
      errorCode: "CONFIRMATION_REQUIRED",
      displayMessage: "This write operation requires confirmed: true."
    });
  });

  it("returns KYC fields for onboarding tool calls", async () => {
    const response = await handleMcp(
      new Request("http://local.test/mcp", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "onboarding-1",
          method: "tools/call",
          params: {
            name: "create_onboarding_application",
            arguments: {
              confirmed: true,
              customerName: "Chen Ming",
              documentCaptureMethod: "image_parsed",
              documentProvided: true,
              documentType: "passport",
              documentNumber: "DEM123456",
              documentExpiryDate: "2035-01-01",
              dateOfBirth: "1986-05-12",
              nationality: "Demo Republic",
              addressProofProvided: true,
              addressProofCaptureMethod: "image_parsed",
              addressProofType: "utility bill",
              addressProofHolderName: "Chen Ming",
              addressProofAddress: "1 Demo Road, Hong Kong",
              addressProofIssueDate: "2026-03-15",
              kycEvidenceProvided: true,
              kycEvidenceCaptureMethod: "manual_upload",
              residentialAddress: "1 Demo Road, Hong Kong",
              occupationTitle: "Family office principal",
              initialDepositCents: 75000000,
              currency: "USD",
              sourceOfFunds: "Company dividends",
              isPep: false,
              originalUserText: "Open an account for Chen Ming.",
              confirmationText: "Confirmed and submit."
            }
          }
        })
      }),
      newEnv()
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.result.structuredContent.ok).toBe(true);
    expect(body.result.structuredContent.data).toMatchObject({
      customerName: "Chen Ming",
      kycStatus: "standard_review",
      reviewReasons: []
    });
    expect(body.result.structuredContent.data.kycChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "kyc_evidence",
          status: "pass"
        })
      ])
    );
  });
});

function newEnv() {
  return { DB: new SmokeD1() as unknown as D1Database } as Env;
}

function query(sql: string, db: SmokeD1, args: unknown[] = []) {
  return {
    first: async () => {
      if (sql.includes("SELECT 1")) {
        return {};
      }

      if (sql.includes("FROM customers")) {
        return {
          id: args[0],
          display_name: "Smoke Client",
          legal_name: "Smoke Client",
          risk_profile: "medium",
          status: "active"
        };
      }

      if (sql.includes("FROM onboarding_applications")) {
        return db.application;
      }

      return null;
    },
    all: async () => {
      if (sql.includes("FROM transactions t") && sql.includes("internal_transfer")) {
        return {
          results: [
            {
              id: "tx-smoke-transfer",
              status: "posted",
              fromAccountNumber: "PB-USD-1001",
              toAccountNumber: "PB-USD-2002",
              amountCents: 2500000,
              currency: "USD",
              memo: "Smoke transfer",
              source: "manual_web",
              operatorId: "demo-operator",
              createdAt: "2026-04-29T00:00:00.000Z"
            }
          ]
        };
      }

      if (sql.includes("FROM products")) {
        return {
          results: [
            {
              id: "product-smoke-cash",
              name: "USD Cash Plus",
              riskLevel: "low",
              currency: "USD",
              minimumSubscriptionCents: 1000000,
              lockupMonths: 0,
              expectedYieldLabel: "Floating cash management yield",
              status: "active"
            }
          ]
        };
      }

      if (sql.includes("FROM transactions")) {
        return { results: [{ id: "tx-smoke-delete" }] };
      }

      if (sql.includes("FROM onboarding_applications")) {
        return { results: [{ id: "application-smoke-delete" }] };
      }

      if (sql.includes("FROM accounts")) {
        return { results: [{ id: "account-smoke-delete" }] };
      }

      if (sql.includes("FROM holdings")) {
        return { results: [{ id: "holding-smoke-delete" }] };
      }

      return { results: [] };
    },
    run: async () => {
      if (sql.includes("INSERT INTO onboarding_applications")) {
        db.application = {
          id: args[0],
          status: "pending_approval",
          customerName: args[1],
          documentCaptureMethod: args[2],
          documentProvided: args[3],
          documentType: args[4],
          documentNumber: args[5],
          documentExpiryDate: args[6],
          dateOfBirth: args[7],
          nationality: args[8],
          addressProofProvided: args[9],
          addressProofCaptureMethod: args[10],
          addressProofType: args[11],
          addressProofHolderName: args[12],
          addressProofAddress: args[13],
          addressProofIssueDate: args[14],
          kycEvidenceProvided: args[15],
          kycEvidenceCaptureMethod: args[16],
          residentialAddress: args[17],
          occupationTitle: args[18],
          initialDepositCents: args[19],
          currency: args[20],
          sourceOfFunds: args[21],
          isPep: args[22],
          initialReview: args[23],
          kycStatus: args[24],
          kycSummary: args[25],
          kycChecksJson: args[26],
          reviewReasonsJson: args[27],
          submittedSource: args[28],
          submittedBy: args[29],
          originalUserText: args[30],
          confirmationText: args[32],
          approvedBy: null,
          approvedAt: null,
          createdCustomerId: null,
          createdAccountId: null,
          createdAt: args[33],
          updatedAt: args[34]
        };
      }

      return { success: true };
    }
  };
}
