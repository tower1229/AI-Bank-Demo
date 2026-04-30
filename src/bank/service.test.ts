import { describe, expect, it } from "vitest";
import {
  BankServiceError,
  createOnboardingApplication,
  createTransfer,
  purchaseProduct,
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
        residentialAddress: "1 Test Street",
        occupationTitle: "Investor",
        initialDepositCents: 100_000_00,
        currency: "USD",
        sourceOfFunds: "Company dividends",
        isPep: false
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
        residentialAddress: "1 Old Road",
        occupationTitle: "Investor",
        initialDepositCents: 500_000_00,
        currency: "USD",
        sourceOfFunds: "Company dividends",
        isPep: false
      }, context)
    ).rejects.toMatchObject({ errorCode: "DOCUMENT_EXPIRED" });
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
              residentialAddress: args[9],
              occupationTitle: args[10],
              initialDepositCents: args[11],
              currency: args[12],
              sourceOfFunds: args[13],
              isPep: args[14],
              initialReview: args[15],
              kycStatus: args[16],
              kycSummary: args[17],
              kycChecksJson: args[18],
              reviewReasonsJson: args[19],
              submittedSource: args[20],
              submittedBy: args[21],
              originalUserText: args[22],
              confirmationText: args[24],
              approvedBy: null,
              approvedAt: null,
              createdCustomerId: null,
              createdAccountId: null,
              createdAt: args[25],
              updatedAt: args[26]
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
