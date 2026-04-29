PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  nationality TEXT,
  date_of_birth TEXT,
  risk_profile TEXT NOT NULL DEFAULT 'medium',
  relationship_manager_id TEXT NOT NULL DEFAULT 'demo-rm',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  account_number TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'private_banking',
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  balance_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  opened_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id);

CREATE TABLE IF NOT EXISTS onboarding_applications (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  document_capture_method TEXT NOT NULL,
  document_provided INTEGER NOT NULL DEFAULT 0,
  document_type TEXT,
  document_number TEXT,
  document_expiry_date TEXT,
  date_of_birth TEXT,
  nationality TEXT,
  residential_address TEXT,
  occupation_title TEXT,
  initial_deposit_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  source_of_funds TEXT NOT NULL,
  is_pep INTEGER NOT NULL DEFAULT 0,
  initial_review TEXT NOT NULL DEFAULT 'standard_review',
  submitted_source TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  original_user_text TEXT,
  structured_params_json TEXT,
  confirmation_text TEXT,
  approved_by TEXT,
  approved_at TEXT,
  created_customer_id TEXT REFERENCES customers(id),
  created_account_id TEXT REFERENCES accounts(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_applications(status);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  minimum_subscription_cents INTEGER NOT NULL,
  lockup_months INTEGER NOT NULL DEFAULT 0,
  expected_yield_label TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  units INTEGER NOT NULL DEFAULT 0,
  cost_basis_cents INTEGER NOT NULL,
  market_value_cents INTEGER NOT NULL,
  opened_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_holdings_customer_id ON holdings(customer_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted',
  from_account_id TEXT REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),
  customer_id TEXT REFERENCES customers(id),
  product_id TEXT REFERENCES products(id),
  holding_id TEXT REFERENCES holdings(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  memo TEXT,
  source TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  original_user_text TEXT,
  confirmation_text TEXT,
  risk_mismatch_acknowledged INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  source TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  operator_display_name TEXT,
  status TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  original_user_text TEXT,
  structured_params_json TEXT,
  confirmation_text TEXT,
  result_message TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
