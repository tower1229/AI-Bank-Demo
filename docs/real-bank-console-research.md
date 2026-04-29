# Real Bank Console Research Notes

Date: 2026-04-29

## Reference Systems Reviewed

- Temenos Wealth Management / Wealth Front Office: public materials emphasize advisor and portfolio manager dashboards, profiling, modelling, performance, risk, compliance, order execution, and portfolio rebalancing.
  - https://www.temenos.com/products/wealth-management/
  - https://www.temenos.com/products/wealth-management/wealth-front-office/
- Avaloq Platform / Client Management: public materials emphasize a front-office one-stop shop for daily tasks, transactions, relationships, prospects, client lifecycle management, client books, contacts, portfolios, search, filters, and integrated core banking data.
  - https://www.avaloq.com/platform/client-management
  - https://www.avaloq.com/solutions/products/avaloq-core
- Infosys Finacle Wealth Management: public materials emphasize advisor enablement, seamless onboarding, portfolio consolidation across asset classes, advanced analytics, monitoring, and review.
  - https://www.finacle.com/solution/wealth-management
- Oracle FLEXCUBE Universal Banking / Private Banking documentation: public materials emphasize core banking product administration and private banking capabilities for planning, recording, tracking, and managing customer wealth across asset classes.
  - https://www.oracle.com/financial-services/banking/flexcube/core-banking-software
  - https://docs.oracle.com/en/industries/financial-services/flexcube.html

## Realistic Column Model for This Demo

The demo should present itself as a private banking operations console, not a generic CRUD dashboard. Keep the current functional scope, but use banking-style workspaces:

- **Dashboard** (`/dashboard`): RM workspace, client book KPIs, cash balances, AUM/product holdings, pending items, recent activity.
- **Client Lifecycle** (`/client-lifecycle`): prospects/onboarding, KYC document fields, source of funds, PEP/enhanced review, approval queue.
- **Client Book** (`/client-book`): customer search, relationship/account view, portfolio, holdings, recent transactions.
- **Payments** (`/payments`): internal USD account transfer entry and account lookup.
- **Investment Orders** (`/investment-orders`): product shelf, suitability/risk mismatch acknowledgement, purchase order entry.
- **Audit & Controls** (`/audit-log`): operational audit, channel/source, operator, entity, result, timestamp.

## Common Terms to Use

- Relationship Manager / RM
- Client book
- Prospect
- Client lifecycle
- KYC / identity document
- Source of funds / source of wealth
- PEP
- Enhanced review
- Private banking account
- Cash account / funding account
- Internal transfer / payment instruction
- Product shelf
- Investment order
- Subscription amount
- Suitability / risk mismatch acknowledgement
- Portfolio / holdings / market value
- Audit trail / operational controls

## Design Cues

- Use a dense left navigation grouped by business domain.
- Prefer compact tables, filters, badges, and action buttons over marketing-style cards.
- Use restrained fintech colors: dark navigation, white data surfaces, muted gray separators, semantic status badges, and one primary action color.
- Show operational context in headers and table labels, not explanatory marketing copy.
