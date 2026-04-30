# AI Bank Demo Requirements

## Goal

Build a demo that shows a private bank relationship manager operating a simulated banking system through Telegram natural language, with OpenClaw orchestrating the conversation and calling bank MCP tools.

The primary success criterion is the end-to-end flow:

Telegram natural language -> OpenClaw agent -> Bank MCP tool -> shared bank business service -> persistent bank data -> bank web console shows the result.

The demo must prioritize a credible workflow and visible data changes over production-grade banking completeness.

## System Shape

The demo has three parts:

1. Simulated private banking system
   - Web console for manual banking operations.
   - API and business service layer.
   - Persistent demo data.
2. MCP service
   - Exposes banking business actions to OpenClaw.
   - Reuses the same service layer as the web API.
3. OpenClaw Telegram entry
   - A dedicated OpenClaw agent owns the Telegram bot.
   - The bot accepts natural language from any Telegram user in DM.

Deployment target:

- Cloudflare hosts the bank web console, API, D1 database, and MCP endpoint.
- The existing cloud server OpenClaw Gateway owns the Telegram bot and connects to the remote MCP endpoint.

## Non-Goals

- No real banking, KYC, sanctions screening, payment processing, custody, or regulated investment logic.
- No complete authentication or role model.
- No real OCR service in the bank backend.
- No storage of original identity document images.
- No multi-currency execution in v1.
- No group chat support in v1.
- No Telegram whitelist in v1.

## Actors

### Demo Relationship Manager

The Telegram user is presented as a private bank relationship manager operating on behalf of clients.

The bank web console uses one built-in highest-permission demo operator. This single operator can create applications, approve applications, transfer funds, and purchase products.

### Existing Client Book

The system should seed a small relationship-manager client book for fast demonstrations:

- Zhang San, USD private bank account, 1,000,000 USD balance, medium risk profile.
- Li Si, USD private bank account, 300,000 USD balance, medium risk profile.
- Wang Wu, USD private bank account, 2,000,000 USD balance, high risk profile.

Seed data should also include products, sample transactions, and optionally sample holdings.

## Core Business Flows

### Onboarding

Onboarding is a two-stage flow:

1. Create onboarding application.
2. Approve onboarding application in the bank web console.

Telegram/OpenClaw can submit an onboarding application but cannot approve it in v1.

When approved, the system creates:

- Customer.
- USD private banking account.
- Initial deposit transaction.
- Opening audit records.

The initial deposit amount is required and is credited automatically at approval time.

### Onboarding Data Collection

The onboarding flow should use a document-first mixed-intake flow. OpenClaw keeps a conversation-local draft, merges fields parsed from uploaded document images with fields supplied by text, asks only for missing fields, and submits only after the relationship manager confirms the final summary.

Fields parsed from a passport or identity document image when available:

- Customer name.
- Document type.
- Document number.
- Date of birth.
- Nationality.
- Document expiry date, if visible.

Fields parsed from an address proof image when available:

- Address proof type.
- Holder or recipient name.
- Residential address.
- Issue date, statement date, or bill date, if visible.

Minimal business fields still supplied by the relationship manager:

- Residential address.
- Occupation or title.
- Initial deposit amount, USD only.
- Source of funds or wealth, one short sentence.
- Whether the client is a PEP.

Fallback path:

- If no image is available, the relationship manager may provide document fields by text.
- The system records `documentCaptureMethod` as `image_parsed`, `manual_text`, or `manual_upload`.
- The system records address proof fields and capture method the same way.
- Before submission, the relationship manager must provide a KYC evidence image. In v1, any uploaded image satisfies this intake step.

The bank system does not store original document images in v1. It stores only structured fields and whether a document was provided.

The bank system stores the final confirmed structured application only. It does not store partial Telegram/OpenClaw intake drafts.

### Onboarding Validation

OpenClaw handles conversational validation:

- Ask only for missing fields.
- Prefer asking for passport, address proof, KYC evidence, and only the few missing business fields.
- Maintain a concise captured/missing/correction-needed draft status during intake.
- Show parsed document fields and allow correction.
- Summarize the application, include KYC review status, and require confirmation before calling MCP.

The bank service layer enforces non-bypassable validation:

- Required fields must be present.
- Customer must be at least 18 years old.
- Document number must not be obviously too short.
- Expired documents are blocked or marked invalid.
- Initial deposit must be greater than 0.
- Currency must be USD.
- Address proof and KYC evidence must be present before submission.
- PEP or vague source of funds marks the application as enhanced review, but does not block submission.
- Write operations without `confirmed: true` are rejected.

The bank service layer also generates a KYC review package for every submitted application:

- Identity document capture.
- Address proof.
- Age eligibility.
- Document validity.
- PEP declaration.
- Source of funds.
- KYC evidence.

The KYC review is stored as structured check results and review reasons. It is for workflow realism only and must not be described as real external KYC, AML, sanctions, tax, PEP, or suitability screening.

### Transfer

Transfers are executed directly after confirmation.

Rules:

- Internal account-to-account transfers only.
- USD only.
- Sender and recipient accounts must exist.
- Sender and recipient accounts cannot be the same.
- Amount must be positive.
- Sender balance must be sufficient.

Successful transfer:

- Decreases sender cash balance.
- Increases recipient cash balance.
- Creates a transaction record.
- Creates an audit log with source, original user text, structured parameters, operator identity, and confirmation text.

### Product Purchase

Product purchases are executed directly after confirmation.

Seed products:

- USD Cash Plus: low risk, minimum 10,000 USD.
- Global Balanced Portfolio: medium risk, minimum 50,000 USD.
- Private Equity Growth Fund: high risk, minimum 250,000 USD, 5-year lockup.

Rules:

- USD only.
- Account must exist.
- Product must be active and purchasable.
- Amount must meet product minimum.
- Account balance must be sufficient.
- Customer risk profile defaults to medium after onboarding.
- A medium-risk customer may buy a high-risk product only after risk mismatch acknowledgement.

Successful purchase:

- Deducts cash balance.
- Creates an order or subscription transaction.
- Creates or increases a holding.
- Writes audit details, including risk mismatch acknowledgement when applicable.

## Web Console Scope

The web console represents the existing bank system. It must support manual operation, not only observation.

Required pages or workspaces:

- Dashboard: customer count, total balances, product holdings, pending onboarding applications, recent activity.
- Onboarding: create application, list applications, view detail, approve application.
- Onboarding application detail: show applicant profile, identity document fields, address proof fields, KYC checklist, review reasons, submission source, original user text, and confirmation text.
- Customers: list customers, view accounts, balances, holdings, and transactions.
- Transfers: manually create internal transfer and view transfer history.
- Products: list products and manually purchase for a customer account.
- Audit Log: show manual web and Telegram/OpenClaw operations side by side.

Manual web operations and MCP operations must call the same business service layer.

Manual write operations also use a confirmation dialog or confirmation page and send `confirmed: true` to the API.

The web console is desktop-first with basic responsive behavior.

## MCP Tool Surface

MCP tools should expose business actions, not low-level CRUD.

Recommended tools:

- `create_onboarding_application`
- `get_onboarding_application`
- `search_customers`
- `create_transfer`
- `list_products`
- `purchase_product`
- `get_customer_portfolio`

Do not expose onboarding approval to the OpenClaw Telegram agent in v1.

Each write tool must require `confirmed: true`.

Tool results should return structured data plus a concise `displayMessage` for stable Telegram replies.

Example success shape:

```json
{
  "ok": true,
  "data": {},
  "displayMessage": "Onboarding application APP-20260429-0001 has been submitted and is pending approval."
}
```

Example error shape:

```json
{
  "ok": false,
  "errorCode": "INSUFFICIENT_BALANCE",
  "displayMessage": "The account balance is insufficient. Current balance is 80,000 USD; requested amount is 100,000 USD."
}
```

## Data Model Baseline

Expected entities:

- Customers.
- Accounts.
- Onboarding applications.
- Transactions.
- Products.
- Product holdings.
- Audit logs.

All money fields should carry `currency`, but v1 only allows `USD`.

All write operations must record:

- Source: `manual_web` or `telegram_openclaw`.
- Operator identity.
- Original natural language text when available.
- Structured parameters.
- Confirmation text or confirmation marker.
- Result status.

## OpenClaw and Telegram Decisions

- Use a dedicated `ai-bank` OpenClaw agent.
- Use a dedicated Telegram bot account.
- OpenClaw Gateway owns Telegram directly.
- Telegram v1 supports DM only.
- No Telegram whitelist in v1.
- All write operations require a second confirmation.
- Draft confirmation state lives in OpenClaw conversation context, not in the bank database.
- Persist only submitted business data and audit logs.

## Implementation Stack

Use TypeScript throughout:

- Frontend: React + Vite + TypeScript.
- Backend/API/MCP: Cloudflare Worker + TypeScript.
- Database: Cloudflare D1.
- Local development: Wrangler with local D1.
- Styling: plain CSS or a small local styling approach.

Recommended structure:

```text
AI-Bank-Demo/
  docs/
  migrations/
  src/
    worker/
    bank/
    web/
  public/
  package.json
  wrangler.toml
  vite.config.ts
```

Key invariant:

- `src/bank` owns the shared business service layer.
- API routes and MCP tools call that same layer.
