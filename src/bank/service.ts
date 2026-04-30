import type { Currency, RiskLevel } from "./types";

export type OperationSource = "manual_web" | "telegram_openclaw";
export type DocumentCaptureMethod = "image_parsed" | "manual_text" | "manual_upload";
export type KycReviewStatus = "standard_review" | "enhanced_review";
export type KycCheckStatus = "pass" | "review" | "fail";

export interface SimulatedKycCheck {
  key: string;
  label: string;
  status: KycCheckStatus;
  detail: string;
}

export interface OperationContext {
  source: OperationSource;
  operatorId: string;
  operatorDisplayName?: string;
  originalUserText?: string;
  confirmationText?: string;
}

interface ConfirmedInput {
  confirmed?: boolean;
}

export interface CreateOnboardingApplicationInput extends ConfirmedInput {
  customerName: string;
  documentCaptureMethod: DocumentCaptureMethod;
  documentProvided?: boolean;
  documentType?: string;
  documentNumber?: string;
  documentExpiryDate?: string;
  dateOfBirth?: string;
  nationality?: string;
  addressProofProvided?: boolean;
  addressProofCaptureMethod?: DocumentCaptureMethod;
  addressProofType?: string;
  addressProofHolderName?: string;
  addressProofAddress?: string;
  addressProofIssueDate?: string;
  kycEvidenceProvided?: boolean;
  kycEvidenceCaptureMethod?: DocumentCaptureMethod;
  residentialAddress: string;
  occupationTitle: string;
  initialDepositCents: number;
  currency: Currency;
  sourceOfFunds: string;
  isPep: boolean;
}

export interface ApproveOnboardingApplicationInput extends ConfirmedInput {
  applicationId: string;
}

export interface DeleteCustomerDemoDataInput extends ConfirmedInput {
  customerId: string;
}

export interface ResetDemoDataInput extends ConfirmedInput {}

export interface CreateTransferInput extends ConfirmedInput {
  fromAccountId?: string;
  fromAccountNumber?: string;
  fromCustomerName?: string;
  toAccountId?: string;
  toAccountNumber?: string;
  toCustomerName?: string;
  amountCents: number;
  currency: Currency;
  memo?: string;
}

export interface PurchaseProductInput extends ConfirmedInput {
  accountId?: string;
  accountNumber?: string;
  customerName?: string;
  productId: string;
  amountCents: number;
  currency: Currency;
  riskMismatchAcknowledged?: boolean;
}

export interface OnboardingApplication {
  id: string;
  status: string;
  customerName: string;
  documentCaptureMethod: DocumentCaptureMethod;
  documentProvided: number;
  documentType: string | null;
  documentNumber: string | null;
  documentExpiryDate: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  addressProofProvided: number;
  addressProofCaptureMethod: DocumentCaptureMethod | null;
  addressProofType: string | null;
  addressProofHolderName: string | null;
  addressProofAddress: string | null;
  addressProofIssueDate: string | null;
  kycEvidenceProvided: number;
  kycEvidenceCaptureMethod: DocumentCaptureMethod | null;
  residentialAddress: string | null;
  occupationTitle: string | null;
  initialDepositCents: number;
  currency: Currency;
  sourceOfFunds: string;
  isPep: number;
  initialReview: string;
  kycStatus: KycReviewStatus;
  kycSummary: string | null;
  kycChecks: SimulatedKycCheck[];
  reviewReasons: string[];
  submittedSource: OperationSource;
  submittedBy: string;
  originalUserText: string | null;
  confirmationText: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdCustomerId: string | null;
  createdAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSearchResult {
  id: string;
  name: string;
  legalName: string;
  riskProfile: RiskLevel;
  status: string;
  accountId: string;
  accountNumber: string;
  currency: Currency;
  balanceCents: number;
}

export interface AccountDetail {
  id: string;
  accountNumber: string;
  currency: Currency;
  balanceCents: number;
  status: string;
}

export interface HoldingDetail {
  id: string;
  productId: string;
  productName: string;
  riskLevel: RiskLevel;
  currency: Currency;
  units: number;
  costBasisCents: number;
  marketValueCents: number;
}

export interface TransactionDetail {
  id: string;
  transactionType: string;
  amountCents: number;
  currency: Currency;
  memo: string | null;
  source: OperationSource;
  createdAt: string;
}

export interface CustomerPortfolio {
  customer: {
    id: string;
    name: string;
    legalName: string;
    riskProfile: RiskLevel;
    status: string;
  };
  accounts: AccountDetail[];
  holdings: HoldingDetail[];
  recentTransactions: TransactionDetail[];
}

export interface DeleteCustomerDemoDataResult {
  customerId: string;
  customerName: string;
  deleted: {
    applications: number;
    accounts: number;
    holdings: number;
    transactions: number;
  };
  displayMessage: string;
}

export interface ResetDemoDataResult {
  displayMessage: string;
  counts: {
    customers: number;
    accounts: number;
    products: number;
    holdings: number;
    transactions: number;
    onboardingApplications: number;
    auditLogs: number;
  };
}

export interface ProductDetail {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  currency: Currency;
  minimumSubscriptionCents: number;
  lockupMonths: number;
  expectedYieldLabel: string | null;
  status: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  source: OperationSource;
  operatorId: string;
  operatorDisplayName: string | null;
  status: string;
  entityType: string | null;
  entityId: string | null;
  resultMessage: string | null;
  createdAt: string;
}

export interface PaymentInstructionSummary {
  id: string;
  status: string;
  fromAccountNumber: string | null;
  toAccountNumber: string | null;
  amountCents: number;
  currency: Currency;
  memo: string | null;
  source: OperationSource;
  operatorId: string;
  createdAt: string;
}

export class BankServiceError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly status = 400
  ) {
    super(message);
  }
}

type AccountRow = {
  id: string;
  customer_id: string;
  account_number: string;
  currency: Currency;
  balance_cents: number;
  status: string;
};

type CustomerRow = {
  id: string;
  display_name: string;
  legal_name: string;
  risk_profile: RiskLevel;
  status: string;
};

type ProductRow = {
  id: string;
  name: string;
  risk_level: RiskLevel;
  currency: Currency;
  minimum_subscription_cents: number;
  lockup_months: number;
  expected_yield_label: string | null;
  status: string;
};

type OnboardingApplicationRow = Omit<OnboardingApplication, "kycChecks" | "reviewReasons"> & {
  kycChecksJson: string | null;
  reviewReasonsJson: string | null;
};

interface SimulatedKycReview {
  status: KycReviewStatus;
  summary: string;
  checks: SimulatedKycCheck[];
  reviewReasons: string[];
}

const VAGUE_SOURCE_VALUES = new Set(["funds", "savings", "income", "business", "investment", "money"]);

export async function createOnboardingApplication(
  db: D1Database,
  input: CreateOnboardingApplicationInput,
  context: OperationContext
): Promise<{ application: OnboardingApplication; displayMessage: string }> {
  requireConfirmed(input);
  requireUsd(input.currency);
  requireText(input.customerName, "Customer name is required.");
  requireText(input.residentialAddress, "Residential address is required.");
  requireText(input.occupationTitle, "Occupation or title is required.");
  requireText(input.sourceOfFunds, "Source of funds is required.");

  if (!Number.isInteger(input.initialDepositCents) || input.initialDepositCents <= 0) {
    throw new BankServiceError("INVALID_INITIAL_DEPOSIT", "Initial deposit must be greater than 0 USD.");
  }

  if (!input.documentProvided && !input.documentNumber) {
    throw new BankServiceError("DOCUMENT_REQUIRED", "Identity document details are required for onboarding.");
  }

  if (input.documentNumber && input.documentNumber.trim().length < 6) {
    throw new BankServiceError("DOCUMENT_NUMBER_TOO_SHORT", "Document number is too short for onboarding.");
  }

  if (!input.addressProofProvided && !input.addressProofAddress) {
    throw new BankServiceError("ADDRESS_PROOF_REQUIRED", "Address proof details are required for onboarding.");
  }

  if (!input.kycEvidenceProvided) {
    throw new BankServiceError("KYC_EVIDENCE_REQUIRED", "KYC evidence image is required before submitting onboarding.");
  }

  if (input.dateOfBirth && getAge(input.dateOfBirth) < 18) {
    throw new BankServiceError("CUSTOMER_UNDER_18", "The customer is under 18. This demo does not allow minor onboarding.");
  }

  if (input.documentExpiryDate && Date.parse(input.documentExpiryDate) < Date.now()) {
    throw new BankServiceError("DOCUMENT_EXPIRED", "The identity document is expired.");
  }

  const kycReview = createSimulatedKycReview(input);
  const now = new Date().toISOString();
  const id = makeId("app");
  const initialReview = kycReview.status;
  const reviewLabel = initialReview.replaceAll("_", " ");
  const displayMessage = `Onboarding application ${formatApplicationRef(id, now)} has been submitted and is pending approval with ${reviewLabel}.`;

  await db
    .prepare(
      `INSERT INTO onboarding_applications (
        id, status, customer_name, document_capture_method, document_provided,
        document_type, document_number, document_expiry_date, date_of_birth,
        nationality, address_proof_provided, address_proof_capture_method,
        address_proof_type, address_proof_holder_name, address_proof_address,
        address_proof_issue_date, kyc_evidence_provided, kyc_evidence_capture_method,
        residential_address, occupation_title, initial_deposit_cents,
        currency, source_of_funds, is_pep, initial_review, kyc_status,
        kyc_summary, kyc_checks_json, review_reasons_json, submitted_source,
        submitted_by, original_user_text, structured_params_json, confirmation_text,
        approved_by, approved_at, created_customer_id, created_account_id,
        created_at, updated_at
      ) VALUES (?, 'pending_approval', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?)`
    )
    .bind(
      id,
      input.customerName.trim(),
      input.documentCaptureMethod,
      input.documentProvided ? 1 : 0,
      nullIfBlank(input.documentType),
      nullIfBlank(input.documentNumber),
      nullIfBlank(input.documentExpiryDate),
      nullIfBlank(input.dateOfBirth),
      nullIfBlank(input.nationality),
      input.addressProofProvided ? 1 : 0,
      nullIfBlank(input.addressProofCaptureMethod),
      nullIfBlank(input.addressProofType),
      nullIfBlank(input.addressProofHolderName),
      nullIfBlank(input.addressProofAddress),
      nullIfBlank(input.addressProofIssueDate),
      input.kycEvidenceProvided ? 1 : 0,
      nullIfBlank(input.kycEvidenceCaptureMethod),
      input.residentialAddress.trim(),
      input.occupationTitle.trim(),
      input.initialDepositCents,
      input.currency,
      input.sourceOfFunds.trim(),
      input.isPep ? 1 : 0,
      initialReview,
      kycReview.status,
      kycReview.summary,
      JSON.stringify(kycReview.checks),
      JSON.stringify(kycReview.reviewReasons),
      context.source,
      context.operatorId,
      context.originalUserText ?? null,
      JSON.stringify(input),
      context.confirmationText ?? null,
      now,
      now
    )
    .run();

  await writeAuditLog(db, {
    action: "create_onboarding_application",
    context,
    status: "success",
    entityType: "onboarding_application",
    entityId: id,
    structuredParams: input,
    resultMessage: displayMessage
  });

  return {
    application: await getOnboardingApplication(db, id),
    displayMessage
  };
}

export async function approveOnboardingApplication(
  db: D1Database,
  input: ApproveOnboardingApplicationInput,
  context: OperationContext
): Promise<{ application: OnboardingApplication; displayMessage: string }> {
  requireConfirmed(input);
  const application = await getOnboardingApplication(db, input.applicationId);

  if (application.status !== "pending_approval") {
    throw new BankServiceError("APPLICATION_NOT_PENDING", "Only pending onboarding applications can be approved.");
  }

  const now = new Date().toISOString();
  const customerId = makeId("customer");
  const accountId = makeId("account");
  const transactionId = makeId("tx");
  const accountNumber = `PB-USD-${customerId.slice(-4).toUpperCase()}`;
  const displayMessage = `${application.customerName} has been approved. Customer and USD private banking account ${accountNumber} were created.`;

  await db.batch([
    db
      .prepare(
        `INSERT INTO customers (
          id, display_name, legal_name, nationality, date_of_birth, risk_profile,
          relationship_manager_id, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'medium', 'demo-rm', 'active', ?, ?)`
      )
      .bind(
        customerId,
        application.customerName,
        application.customerName,
        application.nationality,
        application.dateOfBirth,
        now,
        now
      ),
    db
      .prepare(
        `INSERT INTO accounts (
          id, customer_id, account_number, account_type, currency, balance_cents,
          status, opened_at, created_at, updated_at
        ) VALUES (?, ?, ?, 'private_banking', 'USD', ?, 'active', ?, ?, ?)`
      )
      .bind(accountId, customerId, accountNumber, application.initialDepositCents, now, now, now),
    db
      .prepare(
        `INSERT INTO transactions (
          id, transaction_type, status, from_account_id, to_account_id, customer_id,
          product_id, holding_id, amount_cents, currency, memo, source, operator_id,
          original_user_text, confirmation_text, risk_mismatch_acknowledged, created_at
        ) VALUES (?, 'initial_deposit', 'posted', NULL, ?, ?, NULL, NULL, ?, 'USD', 'Onboarding initial deposit', ?, ?, ?, ?, 0, ?)`
      )
      .bind(
        transactionId,
        accountId,
        customerId,
        application.initialDepositCents,
        context.source,
        context.operatorId,
        context.originalUserText ?? null,
        context.confirmationText ?? null,
        now
      ),
    db
      .prepare(
        `UPDATE onboarding_applications
        SET status = 'approved',
          approved_by = ?,
          approved_at = ?,
          created_customer_id = ?,
          created_account_id = ?,
          updated_at = ?
        WHERE id = ?`
      )
      .bind(context.operatorId, now, customerId, accountId, now, application.id)
  ]);

  await writeAuditLog(db, {
    action: "approve_onboarding_application",
    context,
    status: "success",
    entityType: "onboarding_application",
    entityId: application.id,
    structuredParams: input,
    resultMessage: displayMessage
  });

  return {
    application: await getOnboardingApplication(db, application.id),
    displayMessage
  };
}

export async function listOnboardingApplications(db: D1Database): Promise<OnboardingApplication[]> {
  const result = await db
    .prepare(
      `SELECT ${onboardingSelectColumns()}
      FROM onboarding_applications
      ORDER BY created_at DESC`
    )
    .all<OnboardingApplicationRow>();

  return (result.results ?? []).map(mapOnboardingApplication);
}

export async function getOnboardingApplication(db: D1Database, id: string): Promise<OnboardingApplication> {
  const row = await db
    .prepare(
      `SELECT ${onboardingSelectColumns()}
      FROM onboarding_applications
      WHERE id = ?`
    )
    .bind(id)
    .first<OnboardingApplicationRow>();

  if (!row) {
    throw new BankServiceError("APPLICATION_NOT_FOUND", "Onboarding application was not found.", 404);
  }

  return mapOnboardingApplication(row);
}

export async function searchCustomers(db: D1Database, query = ""): Promise<CustomerSearchResult[]> {
  const like = `%${query.trim()}%`;
  const result = await db
    .prepare(
      `SELECT
        c.id,
        c.display_name AS name,
        c.legal_name AS legalName,
        c.risk_profile AS riskProfile,
        c.status,
        a.id AS accountId,
        a.account_number AS accountNumber,
        a.currency,
        a.balance_cents AS balanceCents
      FROM customers c
      JOIN accounts a ON a.customer_id = c.id
      WHERE c.status = 'active'
        AND (? = '%%'
          OR c.display_name LIKE ?
          OR c.legal_name LIKE ?
          OR a.account_number LIKE ?)
      ORDER BY c.display_name ASC
      LIMIT 25`
    )
    .bind(like, like, like, like)
    .all<CustomerSearchResult>();

  return result.results ?? [];
}

export async function createTransfer(
  db: D1Database,
  input: CreateTransferInput,
  context: OperationContext
): Promise<{ transactionId: string; displayMessage: string }> {
  requireConfirmed(input);
  requireUsd(input.currency);

  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new BankServiceError("INVALID_AMOUNT", "Transfer amount must be greater than 0 USD.");
  }

  const fromAccount = await getAccountByIdentifier(db, input.fromAccountId, input.fromAccountNumber, input.fromCustomerName);
  const toAccount = await getAccountByIdentifier(db, input.toAccountId, input.toAccountNumber, input.toCustomerName);

  if (fromAccount.id === toAccount.id) {
    throw new BankServiceError("SAME_ACCOUNT_TRANSFER", "Sender and recipient accounts cannot be the same.");
  }

  if (fromAccount.currency !== "USD" || toAccount.currency !== "USD") {
    throw new BankServiceError("USD_ONLY", "Only USD internal transfers are supported in v1.");
  }

  if (fromAccount.balance_cents < input.amountCents) {
    throw new BankServiceError(
      "INSUFFICIENT_BALANCE",
      `The account balance is insufficient. Current balance is ${formatUsd(fromAccount.balance_cents)}; requested amount is ${formatUsd(input.amountCents)}.`
    );
  }

  const now = new Date().toISOString();
  const transactionId = makeId("tx");
  const displayMessage = `Transfer ${transactionId} completed: ${formatUsd(input.amountCents)} from ${fromAccount.account_number} to ${toAccount.account_number}.`;

  await db.batch([
    db
      .prepare("UPDATE accounts SET balance_cents = balance_cents - ?, updated_at = ? WHERE id = ?")
      .bind(input.amountCents, now, fromAccount.id),
    db
      .prepare("UPDATE accounts SET balance_cents = balance_cents + ?, updated_at = ? WHERE id = ?")
      .bind(input.amountCents, now, toAccount.id),
    db
      .prepare(
        `INSERT INTO transactions (
          id, transaction_type, status, from_account_id, to_account_id, customer_id,
          product_id, holding_id, amount_cents, currency, memo, source, operator_id,
          original_user_text, confirmation_text, risk_mismatch_acknowledged, created_at
        ) VALUES (?, 'internal_transfer', 'posted', ?, ?, ?, NULL, NULL, ?, 'USD', ?, ?, ?, ?, ?, 0, ?)`
      )
      .bind(
        transactionId,
        fromAccount.id,
        toAccount.id,
        fromAccount.customer_id,
        input.amountCents,
        input.memo ?? null,
        context.source,
        context.operatorId,
        context.originalUserText ?? null,
        context.confirmationText ?? null,
        now
      )
  ]);

  await writeAuditLog(db, {
    action: "create_transfer",
    context,
    status: "success",
    entityType: "transaction",
    entityId: transactionId,
    structuredParams: input,
    resultMessage: displayMessage
  });

  return { transactionId, displayMessage };
}

export async function listPaymentInstructions(db: D1Database, limit = 50): Promise<PaymentInstructionSummary[]> {
  const result = await db
    .prepare(
      `SELECT
        t.id,
        t.status,
        fa.account_number AS fromAccountNumber,
        ta.account_number AS toAccountNumber,
        t.amount_cents AS amountCents,
        t.currency,
        t.memo,
        t.source,
        t.operator_id AS operatorId,
        t.created_at AS createdAt
      FROM transactions t
      LEFT JOIN accounts fa ON fa.id = t.from_account_id
      LEFT JOIN accounts ta ON ta.id = t.to_account_id
      WHERE t.transaction_type = 'internal_transfer'
      ORDER BY t.created_at DESC
      LIMIT ?`
    )
    .bind(Math.min(Math.max(limit, 1), 100))
    .all<PaymentInstructionSummary>();

  return result.results ?? [];
}

export async function listProducts(db: D1Database): Promise<ProductDetail[]> {
  const result = await db
    .prepare(
      `SELECT
        id,
        name,
        risk_level AS riskLevel,
        currency,
        minimum_subscription_cents AS minimumSubscriptionCents,
        lockup_months AS lockupMonths,
        expected_yield_label AS expectedYieldLabel,
        status
      FROM products
      WHERE status = 'active'
      ORDER BY minimum_subscription_cents ASC`
    )
    .all<ProductDetail>();

  return result.results ?? [];
}

export async function purchaseProduct(
  db: D1Database,
  input: PurchaseProductInput,
  context: OperationContext
): Promise<{ transactionId: string; holdingId: string; displayMessage: string }> {
  requireConfirmed(input);
  requireUsd(input.currency);

  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new BankServiceError("INVALID_AMOUNT", "Purchase amount must be greater than 0 USD.");
  }

  const account = await getAccountByIdentifier(db, input.accountId, input.accountNumber, input.customerName);
  const customer = await getCustomer(db, account.customer_id);
  const product = await getProduct(db, input.productId);

  if (account.balance_cents < input.amountCents) {
    throw new BankServiceError(
      "INSUFFICIENT_BALANCE",
      `The account balance is insufficient. Current balance is ${formatUsd(account.balance_cents)}; requested amount is ${formatUsd(input.amountCents)}.`
    );
  }

  if (input.amountCents < product.minimum_subscription_cents) {
    throw new BankServiceError(
      "BELOW_PRODUCT_MINIMUM",
      `Minimum subscription for ${product.name} is ${formatUsd(product.minimum_subscription_cents)}.`
    );
  }

  if (riskRank(customer.risk_profile) < riskRank(product.risk_level) && !input.riskMismatchAcknowledged) {
    throw new BankServiceError(
      "RISK_MISMATCH_ACK_REQUIRED",
      `${product.name} is ${product.risk_level} risk, above ${customer.display_name}'s ${customer.risk_profile} profile. Explicit risk mismatch acknowledgement is required.`
    );
  }

  const now = new Date().toISOString();
  const existingHolding = await db
    .prepare("SELECT id FROM holdings WHERE account_id = ? AND product_id = ?")
    .bind(account.id, product.id)
    .first<{ id: string }>();
  const holdingId = existingHolding?.id ?? makeId("holding");
  const transactionId = makeId("tx");
  const displayMessage = `Product purchase ${transactionId} completed: ${formatUsd(input.amountCents)} of ${product.name} for ${customer.display_name}.`;

  const statements: D1PreparedStatement[] = [
    db
      .prepare("UPDATE accounts SET balance_cents = balance_cents - ?, updated_at = ? WHERE id = ?")
      .bind(input.amountCents, now, account.id)
  ];

  if (existingHolding) {
    statements.push(
      db
        .prepare(
          `UPDATE holdings
          SET units = units + ?,
            cost_basis_cents = cost_basis_cents + ?,
            market_value_cents = market_value_cents + ?,
            updated_at = ?
          WHERE id = ?`
        )
        .bind(input.amountCents, input.amountCents, input.amountCents, now, holdingId)
    );
  } else {
    statements.push(
      db
        .prepare(
          `INSERT INTO holdings (
            id, customer_id, account_id, product_id, currency, units, cost_basis_cents,
            market_value_cents, opened_at, updated_at
          ) VALUES (?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?)`
        )
        .bind(holdingId, customer.id, account.id, product.id, input.amountCents, input.amountCents, input.amountCents, now, now)
    );
  }

  statements.push(
    db
      .prepare(
        `INSERT INTO transactions (
          id, transaction_type, status, from_account_id, to_account_id, customer_id,
          product_id, holding_id, amount_cents, currency, memo, source, operator_id,
          original_user_text, confirmation_text, risk_mismatch_acknowledged, created_at
        ) VALUES (?, 'product_purchase', 'posted', ?, NULL, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        transactionId,
        account.id,
        customer.id,
        product.id,
        holdingId,
        input.amountCents,
        `Purchase ${product.name}`,
        context.source,
        context.operatorId,
        context.originalUserText ?? null,
        context.confirmationText ?? null,
        input.riskMismatchAcknowledged ? 1 : 0,
        now
      )
  );

  await db.batch(statements);

  await writeAuditLog(db, {
    action: "purchase_product",
    context,
    status: "success",
    entityType: "transaction",
    entityId: transactionId,
    structuredParams: input,
    resultMessage: displayMessage
  });

  return { transactionId, holdingId, displayMessage };
}

export async function getCustomerPortfolio(db: D1Database, customerId: string): Promise<CustomerPortfolio> {
  const customer = await getCustomer(db, customerId);
  const [accountResult, holdingResult, transactionResult] = await Promise.all([
    db
      .prepare(
        `SELECT id, account_number AS accountNumber, currency, balance_cents AS balanceCents, status
        FROM accounts
        WHERE customer_id = ?
        ORDER BY opened_at DESC`
      )
      .bind(customerId)
      .all<AccountDetail>(),
    db
      .prepare(
        `SELECT
          h.id,
          h.product_id AS productId,
          p.name AS productName,
          p.risk_level AS riskLevel,
          h.currency,
          h.units,
          h.cost_basis_cents AS costBasisCents,
          h.market_value_cents AS marketValueCents
        FROM holdings h
        JOIN products p ON p.id = h.product_id
        WHERE h.customer_id = ?
        ORDER BY h.opened_at DESC`
      )
      .bind(customerId)
      .all<HoldingDetail>(),
    db
      .prepare(
        `SELECT
          id,
          transaction_type AS transactionType,
          amount_cents AS amountCents,
          currency,
          memo,
          source,
          created_at AS createdAt
        FROM transactions
        WHERE customer_id = ?
        ORDER BY created_at DESC
        LIMIT 20`
      )
      .bind(customerId)
      .all<TransactionDetail>()
  ]);

  return {
    customer: {
      id: customer.id,
      name: customer.display_name,
      legalName: customer.legal_name,
      riskProfile: customer.risk_profile,
      status: customer.status
    },
    accounts: accountResult.results ?? [],
    holdings: holdingResult.results ?? [],
    recentTransactions: transactionResult.results ?? []
  };
}

export async function deleteCustomerDemoData(
  db: D1Database,
  input: DeleteCustomerDemoDataInput,
  context: OperationContext
): Promise<DeleteCustomerDemoDataResult> {
  requireConfirmed(input);
  const customer = await getCustomer(db, input.customerId);

  if (customer.id.startsWith("seed-")) {
    throw new BankServiceError("SEEDED_CUSTOMER_PROTECTED", "Seeded baseline customers cannot be deleted from the demo console.");
  }

  const crossCustomerTransfer = await db
    .prepare(
      `SELECT t.id
      FROM transactions t
      LEFT JOIN accounts fa ON fa.id = t.from_account_id
      LEFT JOIN accounts ta ON ta.id = t.to_account_id
      WHERE t.transaction_type = 'internal_transfer'
        AND (
          (fa.customer_id = ? AND ta.customer_id IS NOT NULL AND ta.customer_id <> ?)
          OR (ta.customer_id = ? AND fa.customer_id IS NOT NULL AND fa.customer_id <> ?)
        )
      LIMIT 1`
    )
    .bind(customer.id, customer.id, customer.id, customer.id)
    .first<{ id: string }>();

  if (crossCustomerTransfer) {
    throw new BankServiceError(
      "CUSTOMER_HAS_CROSS_TRANSFERS",
      "This client has transfer history with another active client. Use Reset data to return the full demo to the seed baseline."
    );
  }

  const [applicationRows, accountRows, holdingRows, transactionRows] = await Promise.all([
    db
      .prepare("SELECT id FROM onboarding_applications WHERE created_customer_id = ?")
      .bind(customer.id)
      .all<{ id: string }>(),
    db.prepare("SELECT id FROM accounts WHERE customer_id = ?").bind(customer.id).all<{ id: string }>(),
    db.prepare("SELECT id FROM holdings WHERE customer_id = ?").bind(customer.id).all<{ id: string }>(),
    db
      .prepare(
        `SELECT DISTINCT id
        FROM transactions
        WHERE customer_id = ?
          OR from_account_id IN (SELECT id FROM accounts WHERE customer_id = ?)
          OR to_account_id IN (SELECT id FROM accounts WHERE customer_id = ?)
          OR holding_id IN (SELECT id FROM holdings WHERE customer_id = ?)`
      )
      .bind(customer.id, customer.id, customer.id, customer.id)
      .all<{ id: string }>()
  ]);

  const deleted = {
    applications: applicationRows.results?.length ?? 0,
    accounts: accountRows.results?.length ?? 0,
    holdings: holdingRows.results?.length ?? 0,
    transactions: transactionRows.results?.length ?? 0
  };
  const transactionScope = `
    customer_id = ?
      OR from_account_id IN (SELECT id FROM accounts WHERE customer_id = ?)
      OR to_account_id IN (SELECT id FROM accounts WHERE customer_id = ?)
      OR holding_id IN (SELECT id FROM holdings WHERE customer_id = ?)
  `;
  const displayMessage = `${customer.display_name} demo client data was deleted. Removed ${deleted.accounts} account(s), ${deleted.holdings} holding(s), ${deleted.transactions} transaction(s), and ${deleted.applications} onboarding application(s).`;

  await db.batch([
    db
      .prepare(
        `DELETE FROM audit_logs
        WHERE (entity_type = 'transaction' AND entity_id IN (SELECT id FROM transactions WHERE ${transactionScope}))
          OR (entity_type = 'onboarding_application' AND entity_id IN (SELECT id FROM onboarding_applications WHERE created_customer_id = ?))
          OR (entity_type = 'customer' AND entity_id = ?)`
      )
      .bind(customer.id, customer.id, customer.id, customer.id, customer.id, customer.id),
    db.prepare(`DELETE FROM transactions WHERE ${transactionScope}`).bind(customer.id, customer.id, customer.id, customer.id),
    db.prepare("DELETE FROM onboarding_applications WHERE created_customer_id = ?").bind(customer.id),
    db.prepare("DELETE FROM holdings WHERE customer_id = ?").bind(customer.id),
    db.prepare("DELETE FROM accounts WHERE customer_id = ?").bind(customer.id),
    db.prepare("DELETE FROM customers WHERE id = ?").bind(customer.id)
  ]);

  await writeAuditLog(db, {
    action: "delete_customer_demo_data",
    context,
    status: "success",
    entityType: "customer",
    entityId: customer.id,
    structuredParams: input,
    resultMessage: displayMessage
  });

  return {
    customerId: customer.id,
    customerName: customer.display_name,
    deleted,
    displayMessage
  };
}

export async function resetDemoData(
  db: D1Database,
  input: ResetDemoDataInput,
  _context: OperationContext
): Promise<ResetDemoDataResult> {
  requireConfirmed(input);

  await db.batch([
    db.prepare("DELETE FROM audit_logs"),
    db.prepare("DELETE FROM transactions"),
    db.prepare("DELETE FROM onboarding_applications"),
    db.prepare("DELETE FROM holdings"),
    db.prepare("DELETE FROM accounts"),
    db.prepare("DELETE FROM customers"),
    db.prepare("DELETE FROM products")
  ]);

  await db.batch(seedStatements(db));

  return {
    displayMessage: "Demo data has been reset to the seeded baseline.",
    counts: {
      customers: 3,
      accounts: 3,
      products: 3,
      holdings: 2,
      transactions: 5,
      onboardingApplications: 1,
      auditLogs: 2
    }
  };
}

export async function listAuditLogs(db: D1Database, limit = 50): Promise<AuditLogEntry[]> {
  const result = await db
    .prepare(
      `SELECT
        id,
        action,
        source,
        operator_id AS operatorId,
        operator_display_name AS operatorDisplayName,
        status,
        entity_type AS entityType,
        entity_id AS entityId,
        result_message AS resultMessage,
        created_at AS createdAt
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?`
    )
    .bind(Math.min(Math.max(limit, 1), 100))
    .all<AuditLogEntry>();

  return result.results ?? [];
}

function seedStatements(db: D1Database): D1PreparedStatement[] {
  return [
    db.prepare(
      `INSERT INTO customers (
        id, display_name, legal_name, nationality, date_of_birth, risk_profile,
        relationship_manager_id, status, created_at, updated_at
      ) VALUES
        ('seed-customer-zhang-san', 'Zhang San', 'Zhang San', 'China', '1982-03-14', 'medium', 'demo-rm', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-customer-li-si', 'Li Si', 'Li Si', 'Singapore', '1978-09-08', 'medium', 'demo-rm', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-customer-wang-wu', 'Wang Wu', 'Wang Wu', 'China', '1975-11-20', 'high', 'demo-rm', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z')`
    ),
    db.prepare(
      `INSERT INTO accounts (
        id, customer_id, account_number, account_type, currency, balance_cents,
        status, opened_at, created_at, updated_at
      ) VALUES
        ('seed-account-zhang-san-usd', 'seed-customer-zhang-san', 'PB-USD-1028', 'private_banking', 'USD', 100000000, 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-account-li-si-usd', 'seed-customer-li-si', 'PB-USD-4186', 'private_banking', 'USD', 30000000, 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-account-wang-wu-usd', 'seed-customer-wang-wu', 'PB-USD-8820', 'private_banking', 'USD', 200000000, 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z')`
    ),
    db.prepare(
      `INSERT INTO products (
        id, name, risk_level, currency, minimum_subscription_cents, lockup_months,
        expected_yield_label, status, created_at, updated_at
      ) VALUES
        ('seed-product-cash-plus', 'USD Cash Plus', 'low', 'USD', 1000000, 0, 'Floating cash management yield', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-product-balanced', 'Global Balanced Portfolio', 'medium', 'USD', 5000000, 0, 'Multi-asset balanced strategy', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-product-pe-growth', 'Private Equity Growth Fund', 'high', 'USD', 25000000, 60, 'Long-term private equity growth', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z')`
    ),
    db.prepare(
      `INSERT INTO holdings (
        id, customer_id, account_id, product_id, currency, units, cost_basis_cents,
        market_value_cents, opened_at, updated_at
      ) VALUES
        ('seed-holding-zhang-balanced', 'seed-customer-zhang-san', 'seed-account-zhang-san-usd', 'seed-product-balanced', 'USD', 250000, 25000000, 25400000, '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
        ('seed-holding-wang-pe', 'seed-customer-wang-wu', 'seed-account-wang-wu-usd', 'seed-product-pe-growth', 'USD', 500000, 50000000, 51250000, '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z')`
    ),
    db.prepare(
      `INSERT INTO transactions (
        id, transaction_type, status, from_account_id, to_account_id, customer_id,
        product_id, holding_id, amount_cents, currency, memo, source, operator_id,
        original_user_text, confirmation_text, risk_mismatch_acknowledged, created_at
      ) VALUES
        ('seed-tx-zhang-initial', 'initial_deposit', 'posted', NULL, 'seed-account-zhang-san-usd', 'seed-customer-zhang-san', NULL, NULL, 100000000, 'USD', 'Seed initial deposit', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:01:00.000Z'),
        ('seed-tx-li-initial', 'initial_deposit', 'posted', NULL, 'seed-account-li-si-usd', 'seed-customer-li-si', NULL, NULL, 30000000, 'USD', 'Seed initial deposit', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:02:00.000Z'),
        ('seed-tx-wang-initial', 'initial_deposit', 'posted', NULL, 'seed-account-wang-wu-usd', 'seed-customer-wang-wu', NULL, NULL, 200000000, 'USD', 'Seed initial deposit', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:03:00.000Z'),
        ('seed-tx-zhang-balanced', 'product_purchase', 'posted', 'seed-account-zhang-san-usd', NULL, 'seed-customer-zhang-san', 'seed-product-balanced', 'seed-holding-zhang-balanced', 25000000, 'USD', 'Seed balanced portfolio holding', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:04:00.000Z'),
        ('seed-tx-wang-pe', 'product_purchase', 'posted', 'seed-account-wang-wu-usd', NULL, 'seed-customer-wang-wu', 'seed-product-pe-growth', 'seed-holding-wang-pe', 50000000, 'USD', 'Seed private equity holding', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:05:00.000Z')`
    ),
    db.prepare(
      `INSERT INTO onboarding_applications (
        id, status, customer_name, document_capture_method, document_provided,
        document_type, document_number, document_expiry_date, date_of_birth,
        nationality, residential_address, occupation_title, initial_deposit_cents,
        currency, source_of_funds, is_pep, initial_review, kyc_status,
        kyc_summary, kyc_checks_json, review_reasons_json, address_proof_provided,
        address_proof_capture_method, address_proof_type, address_proof_holder_name,
        address_proof_address, address_proof_issue_date, kyc_evidence_provided,
        kyc_evidence_capture_method, submitted_source, submitted_by,
        original_user_text, structured_params_json, confirmation_text, approved_by,
        approved_at, created_customer_id, created_account_id, created_at, updated_at
      ) VALUES (
        'seed-onboarding-pending', 'pending_approval', 'Chen Ming', 'manual_text', 1,
        'passport', 'E76543210', '2031-06-30', '1980-06-12', 'China',
        '1 Demo Road, Hong Kong', 'Family office principal', 75000000, 'USD',
        'Business dividends', 0, 'standard_review', 'standard_review',
        'KYC review passed for standard bank approval.',
        '[{"key":"identity_document","label":"Identity document capture","status":"pass","detail":"Structured identity fields were supplied manually for the demo record."},{"key":"address_proof","label":"Address proof","status":"pass","detail":"Address proof details were supplied for the onboarding record."},{"key":"age_eligibility","label":"Age eligibility","status":"pass","detail":"Date of birth indicates the applicant is at least 18 years old."},{"key":"document_validity","label":"Document validity","status":"pass","detail":"Identity document expiry date is in the future."},{"key":"pep_declaration","label":"PEP declaration","status":"pass","detail":"Applicant is not declared as a politically exposed person."},{"key":"source_of_funds","label":"Source of funds","status":"pass","detail":"Source of funds is specific enough for standard bank review."},{"key":"kyc_evidence","label":"KYC evidence","status":"pass","detail":"Additional KYC evidence image was received for intake review."}]',
        '[]', 1, 'manual_text', 'utility bill', 'Chen Ming',
        '1 Demo Road, Hong Kong', '2026-03-15', 1, 'manual_upload',
        'manual_web', 'demo-operator', NULL, '{"seed":true}', 'Seed pending application',
        NULL, NULL, NULL, NULL, '2026-04-29T00:06:00.000Z', '2026-04-29T00:06:00.000Z'
      )`
    ),
    db.prepare(
      `INSERT INTO audit_logs (
        id, action, source, operator_id, operator_display_name, status, entity_type,
        entity_id, original_user_text, structured_params_json, confirmation_text,
        result_message, created_at
      ) VALUES
        ('seed-audit-load', 'seed_data_loaded', 'manual_web', 'demo-operator', 'Demo Operator', 'success', 'system', 'seed', NULL, '{"customers":3,"products":3}', 'Seed data load', 'Seed client book and products are available.', '2026-04-29T00:07:00.000Z'),
        ('seed-audit-pending-onboarding', 'create_onboarding_application', 'manual_web', 'demo-operator', 'Demo Operator', 'success', 'onboarding_application', 'seed-onboarding-pending', NULL, '{"seed":true}', 'Seed pending application', 'Pending onboarding application created for dashboard demo.', '2026-04-29T00:08:00.000Z')`
    )
  ];
}

function onboardingSelectColumns(): string {
  return `
    id,
    status,
    customer_name AS customerName,
    document_capture_method AS documentCaptureMethod,
    document_provided AS documentProvided,
    document_type AS documentType,
    document_number AS documentNumber,
    document_expiry_date AS documentExpiryDate,
    date_of_birth AS dateOfBirth,
    nationality,
    residential_address AS residentialAddress,
    occupation_title AS occupationTitle,
    initial_deposit_cents AS initialDepositCents,
    currency,
    source_of_funds AS sourceOfFunds,
    is_pep AS isPep,
    initial_review AS initialReview,
    kyc_status AS kycStatus,
    kyc_summary AS kycSummary,
    kyc_checks_json AS kycChecksJson,
    review_reasons_json AS reviewReasonsJson,
    address_proof_provided AS addressProofProvided,
    address_proof_capture_method AS addressProofCaptureMethod,
    address_proof_type AS addressProofType,
    address_proof_holder_name AS addressProofHolderName,
    address_proof_address AS addressProofAddress,
    address_proof_issue_date AS addressProofIssueDate,
    kyc_evidence_provided AS kycEvidenceProvided,
    kyc_evidence_capture_method AS kycEvidenceCaptureMethod,
    submitted_source AS submittedSource,
    submitted_by AS submittedBy,
    original_user_text AS originalUserText,
    confirmation_text AS confirmationText,
    approved_by AS approvedBy,
    approved_at AS approvedAt,
    created_customer_id AS createdCustomerId,
    created_account_id AS createdAccountId,
    created_at AS createdAt,
    updated_at AS updatedAt`;
}

function createSimulatedKycReview(input: CreateOnboardingApplicationInput): SimulatedKycReview {
  const reviewReasons: string[] = [];
  const checks: SimulatedKycCheck[] = [];

  checks.push({
    key: "identity_document",
    label: "Identity document capture",
    status: input.documentProvided || Boolean(input.documentNumber) ? "pass" : "fail",
    detail: input.documentCaptureMethod === "image_parsed"
      ? "Structured identity fields were parsed from an uploaded document image."
      : "Structured identity fields were supplied manually for the demo record."
  });

  checks.push({
    key: "address_proof",
    label: "Address proof",
    status: input.addressProofProvided || Boolean(input.addressProofAddress) ? "pass" : "fail",
    detail: input.addressProofCaptureMethod === "image_parsed"
      ? "Address proof fields were parsed from an uploaded document image."
      : "Address proof details were supplied for the onboarding record."
  });

  if (input.dateOfBirth) {
    checks.push({
      key: "age_eligibility",
      label: "Age eligibility",
      status: "pass",
      detail: "Date of birth indicates the applicant is at least 18 years old."
    });
  } else {
    reviewReasons.push("Date of birth was not supplied and should be verified during bank approval.");
    checks.push({
      key: "age_eligibility",
      label: "Age eligibility",
      status: "review",
      detail: "Date of birth was not supplied; bank approval should verify age eligibility."
    });
  }

  if (input.documentExpiryDate) {
    checks.push({
      key: "document_validity",
      label: "Document validity",
      status: "pass",
      detail: "Document expiry date is in the future."
    });
  } else {
    reviewReasons.push("Document expiry date was not supplied and should be checked during approval.");
    checks.push({
      key: "document_validity",
      label: "Document validity",
      status: "review",
      detail: "Document expiry date was not supplied; bank approval should verify validity."
    });
  }

  if (input.isPep) {
    reviewReasons.push("Applicant was declared as PEP.");
    checks.push({
      key: "pep_declaration",
      label: "PEP declaration",
      status: "review",
      detail: "PEP was declared; route to enhanced review."
    });
  } else {
    checks.push({
      key: "pep_declaration",
      label: "PEP declaration",
      status: "pass",
      detail: "Relationship manager declared the applicant is not a PEP."
    });
  }

  if (isVagueSourceOfFunds(input.sourceOfFunds)) {
    reviewReasons.push("Source of funds is too vague for standard review.");
    checks.push({
      key: "source_of_funds",
      label: "Source of funds",
      status: "review",
      detail: "Source of funds needs a more specific explanation before approval."
    });
  } else {
    checks.push({
      key: "source_of_funds",
      label: "Source of funds",
      status: "pass",
      detail: "Source of funds is specific enough for the demo intake."
    });
  }

  checks.push({
    key: "kyc_evidence",
    label: "KYC evidence",
    status: input.kycEvidenceProvided ? "pass" : "fail",
    detail: "KYC evidence image was received for the onboarding record."
  });

  const status: KycReviewStatus = checks.some((check) => check.status === "review") ? "enhanced_review" : "standard_review";
  const summary = status === "enhanced_review"
    ? "KYC review requires enhanced bank-side review before approval."
    : "KYC review is standard and ready for bank-side approval.";

  return {
    status,
    summary,
    checks,
    reviewReasons
  };
}

function mapOnboardingApplication(row: OnboardingApplicationRow): OnboardingApplication {
  const { kycChecksJson, reviewReasonsJson, ...application } = row;

  return {
    ...application,
    kycStatus: row.kycStatus ?? (row.initialReview as KycReviewStatus),
    kycSummary: row.kycSummary,
    kycChecks: parseJsonArray<SimulatedKycCheck>(kycChecksJson),
    reviewReasons: parseJsonArray<string>(reviewReasonsJson)
  };
}

function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

async function getAccountByIdentifier(db: D1Database, id?: string, accountNumber?: string, customerName?: string): Promise<AccountRow> {
  const trimmedId = id?.trim();
  const trimmedAccountNumber = accountNumber?.trim();
  const trimmedCustomerName = customerName?.trim();

  if (!trimmedId && !trimmedAccountNumber && !trimmedCustomerName) {
    throw new BankServiceError("ACCOUNT_REQUIRED", "A client name or USD account identifier is required.");
  }

  const row = await db
    .prepare(
      `SELECT a.*
      FROM accounts a
      LEFT JOIN customers c ON c.id = a.customer_id
      WHERE a.status = 'active'
        AND (
          (? IS NOT NULL AND a.id = ?)
          OR (? IS NOT NULL AND a.account_number = ?)
          OR (? IS NOT NULL AND (lower(c.display_name) = lower(?) OR lower(c.legal_name) = lower(?)))
        )
      ORDER BY a.opened_at DESC
      LIMIT 1`
    )
    .bind(
      trimmedId ?? null,
      trimmedId ?? null,
      trimmedAccountNumber ?? null,
      trimmedAccountNumber ?? null,
      trimmedCustomerName ?? null,
      trimmedCustomerName ?? null,
      trimmedCustomerName ?? null
    )
    .first<AccountRow>();

  if (!row) {
    throw new BankServiceError("ACCOUNT_NOT_FOUND", "The requested account was not found.", 404);
  }

  return row;
}

async function getCustomer(db: D1Database, id: string): Promise<CustomerRow> {
  const row = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first<CustomerRow>();

  if (!row) {
    throw new BankServiceError("CUSTOMER_NOT_FOUND", "The requested customer was not found.", 404);
  }

  return row;
}

async function getProduct(db: D1Database, id: string): Promise<ProductRow> {
  const row = await db.prepare("SELECT * FROM products WHERE id = ? AND status = 'active'").bind(id).first<ProductRow>();

  if (!row) {
    throw new BankServiceError("PRODUCT_NOT_FOUND", "The requested product was not found.", 404);
  }

  return row;
}

async function writeAuditLog(
  db: D1Database,
  input: {
    action: string;
    context: OperationContext;
    status: string;
    entityType: string;
    entityId: string;
    structuredParams: unknown;
    resultMessage: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_logs (
        id, action, source, operator_id, operator_display_name, status, entity_type,
        entity_id, original_user_text, structured_params_json, confirmation_text,
        result_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      makeId("audit"),
      input.action,
      input.context.source,
      input.context.operatorId,
      input.context.operatorDisplayName ?? null,
      input.status,
      input.entityType,
      input.entityId,
      input.context.originalUserText ?? null,
      JSON.stringify(input.structuredParams),
      input.context.confirmationText ?? null,
      input.resultMessage,
      new Date().toISOString()
    )
    .run();
}

function requireConfirmed(input: ConfirmedInput): void {
  if (input.confirmed !== true) {
    throw new BankServiceError("CONFIRMATION_REQUIRED", "This write operation requires confirmed: true.");
  }
}

function requireUsd(currency: Currency): void {
  if (currency !== "USD") {
    throw new BankServiceError("USD_ONLY", "Only USD is supported in v1.");
  }
}

function requireText(value: string | undefined, message: string): void {
  if (!value || !value.trim()) {
    throw new BankServiceError("REQUIRED_FIELD_MISSING", message);
  }
}

function nullIfBlank(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function formatApplicationRef(id: string, isoDate: string): string {
  const date = isoDate.slice(0, 10).replaceAll("-", "");
  return `APP-${date}-${id.slice(-6).toUpperCase()}`;
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function getAge(dateOfBirth: string): number {
  const birth = new Date(`${dateOfBirth}T00:00:00.000Z`);

  if (Number.isNaN(birth.valueOf())) {
    throw new BankServiceError("INVALID_DATE_OF_BIRTH", "Date of birth must be a valid ISO date.");
  }

  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }

  return age;
}

function isVagueSourceOfFunds(source: string): boolean {
  const normalized = source.trim().toLowerCase();
  return normalized.length < 10 || VAGUE_SOURCE_VALUES.has(normalized);
}

function riskRank(risk: RiskLevel): number {
  return { low: 1, medium: 2, high: 3 }[risk];
}
