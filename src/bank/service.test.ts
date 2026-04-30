import { describe, expect, it } from "vitest";
import {
  BankServiceError,
  createOnboardingApplication,
  createTransfer,
  deleteCustomerDemoData,
  purchaseProduct,
  resetDemoData,
  type OperationContext
} from "./service";

const context: OperationContext = {
  source: "manual_web",
  operatorId: "test-operator",
  operatorDisplayName: "Test Operator",
  confirmationText: "Confirmed in test"
};

describe("bank service validation", () => {
  it("rejects write operations without confirmation", async () => {
    await expect(
      createOnboardingApplication({} as D1Database, {
        confirmed: false,
        customerName: "Test Client",
        documentCaptureMethod: "manual_text",
        documentProvided: true,
        documentNumber: "TEST12345",
        addressProofProvided: true,
        addressProofAddress: "1 Test Street",
        kycEvidenceProvided: true,
        residentialAddress: "1 Test Street",
        occupationTitle: "Investor",
        initialDepositCents: 100_000_00,
        currency: "USD",
        sourceOfFunds: "Company dividends",
        isPep: false
      }, context)
    ).rejects.toMatchObject({ errorCode: "CONFIRMATION_REQUIRED" });
  });

  it("rejects customer demo data deletion without confirmation", async () => {
    await expect(
      deleteCustomerDemoData({} as D1Database, {
        confirmed: false,
        customerId: "customer-demo"
      }, context)
    ).rejects.toMatchObject({ errorCode: "CONFIRMATION_REQUIRED" });
  });

  it("blocks minor onboarding applications before writing", async () => {
    await expect(
      createOnboardingApplication({} as D1Database, {
        confirmed: true,
        customerName: "Kevin Lin",
        documentCaptureMethod: "manual_text",
        documentProvided: true,
        documentType: "passport",
        documentNumber: "MINOR12345",
        dateOfBirth: "2015-01-01",
        documentExpiryDate: "2035-01-01",
        nationality: "Demo Republic",
        addressProofProvided: true,
        addressProofCaptureMethod: "manual_text",
        addressProofType: "utility bill",
        addressProofHolderName: "Kevin Lin",
        addressProofAddress: "12 Test Avenue",
        kycEvidenceProvided: true,
        kycEvidenceCaptureMethod: "manual_upload",
        residentialAddress: "12 Test Avenue",
        occupationTitle: "Student",
        initialDepositCents: 300_000_00,
        currency: "USD",
        sourceOfFunds: "Family gift",
        isPep: false
      }, context)
    ).rejects.toMatchObject({ errorCode: "CUSTOMER_UNDER_18" });
  });

  it("marks PEP onboarding as enhanced review", async () => {
    const db = new OnboardingFakeD1();
    const result = await createOnboardingApplication(db as unknown as D1Database, {
      confirmed: true,
      customerName: "Olivia Tan",
      documentCaptureMethod: "manual_text",
      documentProvided: true,
      documentType: "passport",
      documentNumber: "PEP12345",
      dateOfBirth: "1980-01-01",
      documentExpiryDate: "2035-01-01",
      nationality: "Demo Republic",
      addressProofProvided: true,
      addressProofCaptureMethod: "manual_text",
      addressProofType: "utility bill",
      addressProofHolderName: "Olivia Tan",
      addressProofAddress: "9 Orchard Road",
      addressProofIssueDate: "2026-03-01",
      kycEvidenceProvided: true,
      kycEvidenceCaptureMethod: "manual_upload",
      residentialAddress: "9 Orchard Road",
      occupationTitle: "Listed company director",
      initialDepositCents: 1_200_000_00,
      currency: "USD",
      sourceOfFunds: "Corporate equity sale",
      isPep: true
    }, context);

    expect(result.application.initialReview).toBe("enhanced_review");
    expect(result.application.kycStatus).toBe("enhanced_review");
    expect(result.application.reviewReasons).toContain("Applicant was declared as PEP.");
    expect(result.application.kycChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "pep_declaration",
          status: "review"
        })
      ])
    );
    expect(result.displayMessage).toContain("pending approval");
  });

  it("marks complete non-PEP onboarding as standard review", async () => {
    const db = new OnboardingFakeD1();
    const result = await createOnboardingApplication(db as unknown as D1Database, {
      confirmed: true,
      customerName: "Chen Ming",
      documentCaptureMethod: "image_parsed",
      documentProvided: true,
      documentType: "passport",
      documentNumber: "DEM123456",
      dateOfBirth: "1986-05-12",
      documentExpiryDate: "2035-01-01",
      nationality: "Demo Republic",
      addressProofProvided: true,
      addressProofCaptureMethod: "image_parsed",
      addressProofType: "utility bill",
      addressProofHolderName: "Chen Ming",
      addressProofAddress: "1 Demo Road",
      addressProofIssueDate: "2026-03-01",
      kycEvidenceProvided: true,
      kycEvidenceCaptureMethod: "manual_upload",
      residentialAddress: "1 Demo Road",
      occupationTitle: "Family office principal",
      initialDepositCents: 750_000_00,
      currency: "USD",
      sourceOfFunds: "Company dividends",
      isPep: false
    }, context);

    expect(result.application.initialReview).toBe("standard_review");
    expect(result.application.kycStatus).toBe("standard_review");
    expect(result.application.reviewReasons).toEqual([]);
    expect(result.application.kycChecks.every((check) => check.status === "pass")).toBe(true);
  });

  it("rejects insufficient transfer balance", async () => {
    const db = new LookupFakeD1();

    await expect(
      createTransfer(db as unknown as D1Database, {
        confirmed: true,
        fromAccountNumber: "PB-USD-LOW",
        toAccountNumber: "PB-USD-HIGH",
        amountCents: 5_000_000_00,
        currency: "USD"
      }, context)
    ).rejects.toMatchObject({ errorCode: "INSUFFICIENT_BALANCE" });
  });

  it("requires acknowledgement for higher-risk product purchases", async () => {
    const db = new LookupFakeD1();

    await expect(
      purchaseProduct(db as unknown as D1Database, {
        confirmed: true,
        accountNumber: "PB-USD-HIGH",
        productId: "high-risk-product",
        amountCents: 500_000_00,
        currency: "USD"
      }, context)
    ).rejects.toMatchObject({ errorCode: "RISK_MISMATCH_ACK_REQUIRED" });
  });

  it("blocks expired identity documents before writing", async () => {
    await expect(
      createOnboardingApplication({} as D1Database, {
        confirmed: true,
        customerName: "Expired Client",
        documentCaptureMethod: "manual_text",
        documentProvided: true,
        documentType: "passport",
        documentNumber: "EXP12345",
        dateOfBirth: "1980-01-01",
        documentExpiryDate: "2020-01-01",
        nationality: "Demo Republic",
        addressProofProvided: true,
        addressProofAddress: "1 Old Road",
        kycEvidenceProvided: true,
        residentialAddress: "1 Old Road",
        occupationTitle: "Investor",
        initialDepositCents: 500_000_00,
        currency: "USD",
        sourceOfFunds: "Company dividends",
        isPep: false
      }, context)
    ).rejects.toMatchObject({ errorCode: "DOCUMENT_EXPIRED" });
  });

  it("blocks seeded baseline customer deletion", async () => {
    const db = new DeleteCustomerFakeD1("seed-customer-1");

    await expect(
      deleteCustomerDemoData(db as unknown as D1Database, {
        confirmed: true,
        customerId: "seed-customer-1"
      }, context)
    ).rejects.toMatchObject({ errorCode: "SEEDED_CUSTOMER_PROTECTED" });
    expect(db.batches).toHaveLength(0);
  });

  it("deletes linked customer demo records", async () => {
    const db = new DeleteCustomerFakeD1("customer-demo");
    const result = await deleteCustomerDemoData(db as unknown as D1Database, {
      confirmed: true,
      customerId: "customer-demo"
    }, context);

    expect(result.customerName).toBe("Demo Client");
    expect(result.deleted).toEqual({
      applications: 1,
      accounts: 2,
      holdings: 1,
      transactions: 2
    });
    expect(db.batches[0].map((sql) => sql.replace(/\s+/g, " ").trim())).toEqual([
      expect.stringContaining("DELETE FROM audit_logs"),
      expect.stringContaining("DELETE FROM transactions"),
      "DELETE FROM onboarding_applications WHERE created_customer_id = ?",
      "DELETE FROM holdings WHERE customer_id = ?",
      "DELETE FROM accounts WHERE customer_id = ?",
      "DELETE FROM customers WHERE id = ?"
    ]);
    expect(db.auditActions).toContain("delete_customer_demo_data");
  });

  it("blocks single-customer deletion when cross-customer transfers exist", async () => {
    const db = new DeleteCustomerFakeD1("customer-demo", true);

    await expect(
      deleteCustomerDemoData(db as unknown as D1Database, {
        confirmed: true,
        customerId: "customer-demo"
      }, context)
    ).rejects.toMatchObject({ errorCode: "CUSTOMER_HAS_CROSS_TRANSFERS" });
    expect(db.batches).toHaveLength(0);
  });

  it("resets demo data to seeded baseline", async () => {
    const db = new ResetDemoFakeD1();
    const result = await resetDemoData(db as unknown as D1Database, { confirmed: true }, context);

    expect(result.counts).toMatchObject({
      customers: 3,
      accounts: 3,
      products: 3,
      holdings: 2,
      transactions: 5,
      onboardingApplications: 1,
      auditLogs: 2
    });
    expect(db.batches).toHaveLength(2);
    expect(db.batches[0]).toEqual([
      "DELETE FROM audit_logs",
      "DELETE FROM transactions",
      "DELETE FROM onboarding_applications",
      "DELETE FROM holdings",
      "DELETE FROM accounts",
      "DELETE FROM customers",
      "DELETE FROM products"
    ]);
    expect(db.batches[1]).toHaveLength(7);
    expect(db.batches[1][0]).toContain("INSERT INTO customers");
    expect(db.batches[1][6]).toContain("INSERT INTO audit_logs");
  });
});

class OnboardingFakeD1 {
  private application: Record<string, unknown> | null = null;

  prepare(sql: string) {
    return {
      bind: (...args: unknown[]) => ({
        run: async () => {
          if (sql.includes("INSERT INTO onboarding_applications")) {
            expectInsertColumnValueCountToMatch(sql);
            this.application = {
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
        },
        first: async () => {
          if (sql.includes("FROM onboarding_applications")) {
            return this.application;
          }
          return null;
        }
      })
    };
  }
}

function expectInsertColumnValueCountToMatch(sql: string) {
  const match = sql.match(/INSERT INTO onboarding_applications \(([\s\S]+?)\)\s+VALUES \(([\s\S]+?)\)/);
  expect(match).not.toBeNull();

  const columns = match?.[1].split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  const values = match?.[2].split(",").map((part) => part.trim()).filter(Boolean) ?? [];

  expect(values).toHaveLength(columns.length);
}

class LookupFakeD1 {
  prepare(sql: string) {
    return {
      bind: (...args: unknown[]) => ({
        first: async () => {
          if (sql.includes("FROM accounts")) {
            const accountNumber = args.find((arg) => typeof arg === "string" && String(arg).startsWith("PB-USD-"));
            return accountNumber === "PB-USD-LOW"
              ? {
                  id: "account-low",
                  customer_id: "customer-medium",
                  account_number: "PB-USD-LOW",
                  currency: "USD",
                  balance_cents: 300_000_00,
                  status: "active"
                }
              : {
                  id: "account-high",
                  customer_id: "customer-medium",
                  account_number: "PB-USD-HIGH",
                  currency: "USD",
                  balance_cents: 1_000_000_00,
                  status: "active"
                };
          }

          if (sql.includes("FROM customers")) {
            return {
              id: "customer-medium",
              display_name: "Zhang San",
              legal_name: "Zhang San",
              risk_profile: "medium",
              status: "active"
            };
          }

          if (sql.includes("FROM products")) {
            return {
              id: "high-risk-product",
              name: "Private Equity Growth Fund",
              risk_level: "high",
              currency: "USD",
              minimum_subscription_cents: 250_000_00,
              lockup_months: 60,
              expected_yield_label: "Long-term private equity growth",
              status: "active"
            };
          }

          return null;
        }
      })
    };
  }

  async batch() {
    throw new BankServiceError("UNEXPECTED_WRITE", "The test should fail before writing.");
  }
}

class DeleteCustomerFakeD1 {
  batches: string[][] = [];
  auditActions: unknown[] = [];

  constructor(
    private readonly customerId: string,
    private readonly hasCrossCustomerTransfer = false
  ) {}

  prepare(sql: string) {
    return {
      bind: (...args: unknown[]) => ({
        sql,
        toString: () => sql,
        first: async () => {
          if (sql.includes("FROM customers")) {
            return {
              id: args[0],
              display_name: args[0] === this.customerId ? "Demo Client" : "Other Client",
              legal_name: "Demo Client",
              risk_profile: "medium",
              status: "active"
            };
          }

          if (sql.includes("transaction_type = 'internal_transfer'")) {
            return this.hasCrossCustomerTransfer ? { id: "tx-cross-customer" } : null;
          }

          return null;
        },
        all: async () => {
          if (sql.includes("FROM transactions")) {
            return { results: [{ id: "tx-demo-1" }, { id: "tx-demo-2" }] };
          }

          if (sql.includes("FROM onboarding_applications")) {
            return { results: [{ id: "application-demo" }] };
          }

          if (sql.includes("FROM accounts")) {
            return { results: [{ id: "account-demo-1" }, { id: "account-demo-2" }] };
          }

          if (sql.includes("FROM holdings")) {
            return { results: [{ id: "holding-demo" }] };
          }

          return { results: [] };
        },
        run: async () => {
          if (sql.includes("INSERT INTO audit_logs")) {
            this.auditActions.push(args[1]);
          }

          return { success: true };
        }
      })
    };
  }

  async batch(statements: D1PreparedStatement[]) {
    this.batches.push(statements.map((statement) => String(statement)));
    return statements.map(() => ({ success: true }));
  }
}

class ResetDemoFakeD1 {
  batches: string[][] = [];

  prepare(sql: string) {
    return {
      sql,
      toString: () => sql,
      run: async () => ({ success: true }),
      bind: () => ({
        sql,
        toString: () => sql,
        run: async () => ({ success: true })
      })
    };
  }

  async batch(statements: D1PreparedStatement[]) {
    this.batches.push(statements.map((statement) => String(statement)));
    return statements.map(() => ({ success: true }));
  }
}
