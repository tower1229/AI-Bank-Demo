import type { Currency, RiskLevel } from "./types";

export type OperationSource = "manual_web" | "telegram_openclaw";
export type DocumentCaptureMethod = "image_parsed" | "manual_text" | "manual_upload";

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

export interface CreateTransferInput extends ConfirmedInput {
  fromAccountId?: string;
  fromAccountNumber?: string;
  toAccountId?: string;
  toAccountNumber?: string;
  amountCents: number;
  currency: Currency;
  memo?: string;
}

export interface PurchaseProductInput extends ConfirmedInput {
  accountId?: string;
  accountNumber?: string;
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
  residentialAddress: string | null;
  occupationTitle: string | null;
  initialDepositCents: number;
  currency: Currency;
  sourceOfFunds: string;
  isPep: number;
  initialReview: string;
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

  if (input.dateOfBirth && getAge(input.dateOfBirth) < 18) {
    throw new BankServiceError("CUSTOMER_UNDER_18", "The customer is under 18. This demo does not allow minor onboarding.");
  }

  if (input.documentExpiryDate && Date.parse(input.documentExpiryDate) < Date.now()) {
    throw new BankServiceError("DOCUMENT_EXPIRED", "The identity document is expired.");
  }

  const now = new Date().toISOString();
  const id = makeId("app");
  const initialReview = input.isPep || isVagueSourceOfFunds(input.sourceOfFunds) ? "enhanced_review" : "standard_review";
  const displayMessage = `Onboarding application ${formatApplicationRef(id, now)} has been submitted and is pending approval.`;

  await db
    .prepare(
      `INSERT INTO onboarding_applications (
        id, status, customer_name, document_capture_method, document_provided,
        document_type, document_number, document_expiry_date, date_of_birth,
        nationality, residential_address, occupation_title, initial_deposit_cents,
        currency, source_of_funds, is_pep, initial_review, submitted_source,
        submitted_by, original_user_text, structured_params_json, confirmation_text,
        approved_by, approved_at, created_customer_id, created_account_id,
        created_at, updated_at
      ) VALUES (?, 'pending_approval', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?)`
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
      input.residentialAddress.trim(),
      input.occupationTitle.trim(),
      input.initialDepositCents,
      input.currency,
      input.sourceOfFunds.trim(),
      input.isPep ? 1 : 0,
      initialReview,
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
    .all<OnboardingApplication>();

  return result.results ?? [];
}

export async function getOnboardingApplication(db: D1Database, id: string): Promise<OnboardingApplication> {
  const row = await db
    .prepare(
      `SELECT ${onboardingSelectColumns()}
      FROM onboarding_applications
      WHERE id = ?`
    )
    .bind(id)
    .first<OnboardingApplication>();

  if (!row) {
    throw new BankServiceError("APPLICATION_NOT_FOUND", "Onboarding application was not found.", 404);
  }

  return row;
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

  const fromAccount = await getAccountByIdentifier(db, input.fromAccountId, input.fromAccountNumber);
  const toAccount = await getAccountByIdentifier(db, input.toAccountId, input.toAccountNumber);

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

  const account = await getAccountByIdentifier(db, input.accountId, input.accountNumber);
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

async function getAccountByIdentifier(db: D1Database, id?: string, accountNumber?: string): Promise<AccountRow> {
  const trimmedId = id?.trim();
  const trimmedAccountNumber = accountNumber?.trim();

  if (!trimmedId && !trimmedAccountNumber) {
    throw new BankServiceError("ACCOUNT_REQUIRED", "A USD account id or account number is required.");
  }

  const row = trimmedId
    ? await db.prepare("SELECT * FROM accounts WHERE id = ? AND status = 'active'").bind(trimmedId).first<AccountRow>()
    : await db
        .prepare("SELECT * FROM accounts WHERE account_number = ? AND status = 'active'")
        .bind(trimmedAccountNumber)
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
