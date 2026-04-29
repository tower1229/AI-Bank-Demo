PRAGMA foreign_keys = OFF;

DELETE FROM audit_logs WHERE id LIKE 'seed-%';
DELETE FROM transactions WHERE id LIKE 'seed-%';
DELETE FROM holdings WHERE id LIKE 'seed-%';
DELETE FROM accounts WHERE id LIKE 'seed-%';
DELETE FROM customers WHERE id LIKE 'seed-%';
DELETE FROM products WHERE id LIKE 'seed-%';
DELETE FROM onboarding_applications WHERE id LIKE 'seed-%';

PRAGMA foreign_keys = ON;

INSERT INTO customers (
  id, display_name, legal_name, nationality, date_of_birth, risk_profile,
  relationship_manager_id, status, created_at, updated_at
) VALUES
  ('seed-customer-zhang-san', 'Zhang San', 'Zhang San', 'China', '1982-03-14', 'medium', 'demo-rm', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-customer-li-si', 'Li Si', 'Li Si', 'Singapore', '1978-09-08', 'medium', 'demo-rm', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-customer-wang-wu', 'Wang Wu', 'Wang Wu', 'China', '1975-11-20', 'high', 'demo-rm', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z');

INSERT INTO accounts (
  id, customer_id, account_number, account_type, currency, balance_cents,
  status, opened_at, created_at, updated_at
) VALUES
  ('seed-account-zhang-san-usd', 'seed-customer-zhang-san', 'PB-USD-1028', 'private_banking', 'USD', 100000000, 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-account-li-si-usd', 'seed-customer-li-si', 'PB-USD-4186', 'private_banking', 'USD', 30000000, 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-account-wang-wu-usd', 'seed-customer-wang-wu', 'PB-USD-8820', 'private_banking', 'USD', 200000000, 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z');

INSERT INTO products (
  id, name, risk_level, currency, minimum_subscription_cents, lockup_months,
  expected_yield_label, status, created_at, updated_at
) VALUES
  ('seed-product-cash-plus', 'USD Cash Plus', 'low', 'USD', 1000000, 0, 'Floating cash management yield', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-product-balanced', 'Global Balanced Portfolio', 'medium', 'USD', 5000000, 0, 'Multi-asset balanced strategy', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-product-pe-growth', 'Private Equity Growth Fund', 'high', 'USD', 25000000, 60, 'Long-term private equity growth', 'active', '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z');

INSERT INTO holdings (
  id, customer_id, account_id, product_id, currency, units, cost_basis_cents,
  market_value_cents, opened_at, updated_at
) VALUES
  ('seed-holding-zhang-balanced', 'seed-customer-zhang-san', 'seed-account-zhang-san-usd', 'seed-product-balanced', 'USD', 250000, 25000000, 25400000, '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z'),
  ('seed-holding-wang-pe', 'seed-customer-wang-wu', 'seed-account-wang-wu-usd', 'seed-product-pe-growth', 'USD', 500000, 50000000, 51250000, '2026-04-29T00:00:00.000Z', '2026-04-29T00:00:00.000Z');

INSERT INTO transactions (
  id, transaction_type, status, from_account_id, to_account_id, customer_id,
  product_id, holding_id, amount_cents, currency, memo, source, operator_id,
  original_user_text, confirmation_text, risk_mismatch_acknowledged, created_at
) VALUES
  ('seed-tx-zhang-initial', 'initial_deposit', 'posted', NULL, 'seed-account-zhang-san-usd', 'seed-customer-zhang-san', NULL, NULL, 100000000, 'USD', 'Seed initial deposit', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:01:00.000Z'),
  ('seed-tx-li-initial', 'initial_deposit', 'posted', NULL, 'seed-account-li-si-usd', 'seed-customer-li-si', NULL, NULL, 30000000, 'USD', 'Seed initial deposit', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:02:00.000Z'),
  ('seed-tx-wang-initial', 'initial_deposit', 'posted', NULL, 'seed-account-wang-wu-usd', 'seed-customer-wang-wu', NULL, NULL, 200000000, 'USD', 'Seed initial deposit', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:03:00.000Z'),
  ('seed-tx-zhang-balanced', 'product_purchase', 'posted', 'seed-account-zhang-san-usd', NULL, 'seed-customer-zhang-san', 'seed-product-balanced', 'seed-holding-zhang-balanced', 25000000, 'USD', 'Seed balanced portfolio holding', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:04:00.000Z'),
  ('seed-tx-wang-pe', 'product_purchase', 'posted', 'seed-account-wang-wu-usd', NULL, 'seed-customer-wang-wu', 'seed-product-pe-growth', 'seed-holding-wang-pe', 50000000, 'USD', 'Seed private equity holding', 'manual_web', 'demo-operator', NULL, 'Seed data load', 0, '2026-04-29T00:05:00.000Z');

INSERT INTO onboarding_applications (
  id, status, customer_name, document_capture_method, document_provided,
  document_type, document_number, document_expiry_date, date_of_birth,
  nationality, residential_address, occupation_title, initial_deposit_cents,
  currency, source_of_funds, is_pep, initial_review, submitted_source,
  submitted_by, original_user_text, structured_params_json, confirmation_text,
  approved_by, approved_at, created_customer_id, created_account_id,
  created_at, updated_at
) VALUES
  ('seed-onboarding-pending', 'pending_approval', 'Chen Ming', 'manual_text', 1, 'passport', 'E76543210', '2031-06-30', '1980-06-12', 'China', '1 Demo Road, Hong Kong', 'Family office principal', 75000000, 'USD', 'Business dividends', 0, 'standard_review', 'manual_web', 'demo-operator', NULL, '{"seed":true}', 'Seed pending application', NULL, NULL, NULL, NULL, '2026-04-29T00:06:00.000Z', '2026-04-29T00:06:00.000Z');

INSERT INTO audit_logs (
  id, action, source, operator_id, operator_display_name, status, entity_type,
  entity_id, original_user_text, structured_params_json, confirmation_text,
  result_message, created_at
) VALUES
  ('seed-audit-load', 'seed_data_loaded', 'manual_web', 'demo-operator', 'Demo Operator', 'success', 'system', 'seed', NULL, '{"customers":3,"products":3}', 'Seed data load', 'Seed client book and products are available.', '2026-04-29T00:07:00.000Z'),
  ('seed-audit-pending-onboarding', 'create_onboarding_application', 'manual_web', 'demo-operator', 'Demo Operator', 'success', 'onboarding_application', 'seed-onboarding-pending', NULL, '{"seed":true}', 'Seed pending application', 'Pending onboarding application created for dashboard demo.', '2026-04-29T00:08:00.000Z');
