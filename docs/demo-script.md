# Demo Script

## Setup

Open:

- The bank web console dashboard.
- Telegram DM with the AI Bank Demo bot.
- Optional OpenClaw logs for technical audiences.

Confirm that seed data exists:

- Zhang San has a USD private bank account with 1,000,000 USD.
- Li Si has a USD private bank account with 300,000 USD.
- Wang Wu has a USD private bank account with 2,000,000 USD.
- Products are visible: USD Cash Plus, Global Balanced Portfolio, Private Equity Growth Fund.

## Part 1: Show the Existing Bank Console

Narrative:

The bank already has a working internal system. Staff can manually create applications, approve onboarding, transfer funds, and buy products. The AI layer improves the operating experience but does not replace the core system.

Steps:

1. Open the dashboard.
2. Show customers, accounts, products, transactions, and audit log.
3. Create a manual onboarding application from the web console.
4. Submit it after the confirmation dialog.
5. Approve it from the application detail page.
6. Show that a customer, account, initial deposit, and audit records were created.

## Part 2: AI-Assisted Onboarding

Telegram message:

```text
Help client Zhang San open a private banking account. Initial deposit is 1,000,000 USD. Funds come from company dividends.
```

Expected AI behavior:

- Ask for a passport or identity document image.
- Ask only for missing business fields:
  - Residential address.
  - Occupation or title.
  - Whether the client is a PEP.

Demo input after the prompt:

```text
Address is 88 Finance Street, Shanghai. He is a technology company founder. Not a PEP.
```

Then upload a passport or identity document image, or use the fallback:

```text
Use manual document input. Passport number E12345678, date of birth 1982-03-14, nationality China, expiry 2032-03-13.
```

Expected AI behavior:

- Show parsed or manually supplied document fields.
- Ask for correction if needed.
- Summarize the onboarding application.
- Ask for confirmation.

Confirmation:

```text
Confirm and submit.
```

Expected result:

- AI calls `create_onboarding_application`.
- Telegram returns an application ID and pending approval status.
- Web console shows the pending onboarding application.
- Approve it in the web console.
- Customer, account, initial deposit, transaction, and audit log appear.

## Part 3: AI-Assisted Transfer

Telegram message:

```text
Help Zhang San transfer 100,000 USD to Li Si. Memo is family office fees.
```

Expected AI behavior:

- Search customers and accounts.
- Resolve Zhang San and Li Si.
- Summarize payer, recipient, amount, currency, and memo.
- Ask for confirmation.

Confirmation:

```text
Confirm.
```

Expected result:

- AI calls `create_transfer`.
- Zhang San's balance decreases by 100,000 USD.
- Li Si's balance increases by 100,000 USD.
- Transfer transaction and audit log appear in the web console.

## Part 4: AI-Assisted Product Purchase

Telegram message:

```text
Buy 250,000 USD of Global Balanced Portfolio for Zhang San using his USD private bank account.
```

Expected AI behavior:

- Resolve customer and account.
- Look up the product.
- Summarize product, amount, risk level, and funding account.
- Ask for confirmation.

Confirmation:

```text
Confirm.
```

Expected result:

- AI calls `purchase_product`.
- Cash balance decreases.
- Holding is created or increased.
- Purchase transaction and audit log appear in the web console.

## Failure and Rigor Scenarios

### Missing Onboarding Information

Telegram message:

```text
Open a private banking account for Chen Ming.
```

Expected behavior:

- AI asks for identity document and the minimal missing business fields.
- AI does not submit until required fields are complete and confirmed.

### Invalid Minor Client

Provide a date of birth that makes the client under 18.

Expected behavior:

- AI or service blocks submission.
- Reply explains that the client is under the demo minimum age.

### Insufficient Balance Transfer

Telegram message:

```text
Transfer 5,000,000 USD from Li Si to Zhang San.
```

Expected behavior:

- AI asks for confirmation if all fields are clear.
- Service rejects execution because balance is insufficient.
- AI relays the tool's `displayMessage`.

### High-Risk Product Mismatch

Telegram message:

```text
Buy 500,000 USD of Private Equity Growth Fund for Zhang San.
```

Expected behavior:

- AI explains product risk is high while Zhang San's default risk profile is medium.
- AI asks for explicit risk mismatch acknowledgement.
- Purchase is executed only after acknowledgement and confirmation.

## Closing Message

Narrative:

The same banking service layer powers the manual web console and the OpenClaw MCP tools. The AI does not bypass controls; it collects information, confirms intent, calls structured business tools, and leaves an audit trail.
