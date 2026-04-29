# Project Handoff

## Current Snapshot

Date: 2026-04-29

The project is an AI Bank Demo for showing Telegram natural language control of a simulated private banking system through OpenClaw and MCP.

The repository now contains a working vertical demo slice:

- TypeScript + React/Vite frontend.
- Cloudflare Worker serving API routes and Vite static assets.
- D1 migration for the v1 demo entities.
- Repeatable local seed SQL.
- Shared `src/bank` service layer for manual web and MCP operations.
- Health, seed status, dashboard, onboarding, customer, transfer, product, and audit APIs.
- Unauthenticated demo MCP endpoint exposing business-action tools.
- Web console for onboarding creation/approval, customer portfolios, internal transfers, product purchases, and audit review.

The browser-facing system name is now `Core Bank System`. The broader project/docs may still refer to `AI Bank Demo` as the overall demo initiative.

Full production authentication, real KYC/compliance, and real banking integrations remain out of scope.

## Decisions Already Locked

- OpenClaw owns the Telegram bot directly.
- Cloudflare hosts the bank web console, API, D1 database, and MCP endpoint.
- Use a dedicated OpenClaw agent: `ai-bank`.
- Use a dedicated Telegram account id: `ai-bank-demo`.
- Telegram DM is open to anyone for the demo.
- Telegram group chat is out of scope for v1.
- The web console supports manual business operations and approvals.
- Manual web operations and MCP operations must share one service layer.
- Onboarding is two-stage: submit application, then approve in web console.
- Telegram/OpenClaw cannot approve onboarding in v1.
- Transfer and product purchase execute after confirmation.
- All writes require confirmation.
- v1 supports USD only.
- v1 supports internal transfers only.
- Identity document images are interpreted by OpenClaw; the bank stores structured fields, not images.
- Seed data should represent a relationship manager's client book.

## Confirmed Demo Data Shape

Seed customers:

- Zhang San: 1,000,000 USD, medium risk.
- Li Si: 300,000 USD, medium risk.
- Wang Wu: 2,000,000 USD, high risk.

Seed products:

- USD Cash Plus: low risk, minimum 10,000 USD.
- Global Balanced Portfolio: medium risk, minimum 50,000 USD.
- Private Equity Growth Fund: high risk, minimum 250,000 USD, 5-year lockup.

## OpenClaw Status

The user tested the Telegram bot and received the AI Bank Demo persona response.

Observed behavior:

- `test` returned an AI Bank Demo assistant greeting.
- A transfer request asked for payer and recipient account details instead of executing directly.
- An onboarding request asked for identity document image/manual identity fields and minimal business fields.

Interpretation:

- Telegram bot wiring is likely correct.
- `ai-bank` routing and prompt behavior are likely correct.
- Bank MCP connectivity should now be verified against the deployed `/mcp` endpoint.

The Worker currently implements `/mcp` without authorization for demo use.

## Cross-Device Resume

On a fresh checkout, restore local dependencies and local D1 state:

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Open the web console:

```text
http://localhost:8787
```

Quick checks:

```bash
curl http://localhost:8787/api/health
curl http://localhost:8787/api/seed/status
curl http://localhost:8787/api/dashboard
curl http://localhost:8787/mcp
```

Expected current behavior:

- `/api/health` returns ok and says `Core Bank System API and D1 are reachable.`
- `/api/seed/status` reports seeded data.
- `/api/dashboard` returns non-empty metrics, customers, products, and recent activity.
- `/mcp` returns the MCP tool list on GET and supports JSON-RPC `initialize`, `tools/list`, and `tools/call` on POST.

## Vertical Slice Verification

Completed locally:

- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm run test`
- `npm run db:migrate:local`
- `npm run db:seed:local`
- `curl http://localhost:8787/api/health`
- `curl http://localhost:8787/api/seed/status`
- `curl http://localhost:8787/api/dashboard`
- HTTP smoke: create onboarding application, approve it, transfer funds, purchase product.
- MCP smoke: list tools, search customers, create transfer.

Observed seed counts:

- Customers: 3
- Products: 3
- Audit logs: 2
- Pending onboarding applications: 1

## Important Security Note

Real tokens were pasted during setup review. They should be rotated before any public push or deployment.

Rotate at least:

- Telegram bot tokens.
- OpenClaw gateway token.
- LLM/provider API keys.
- Search/plugin API keys.
- QQBot client secret.

The repository now ignores `.env`, `.dev.vars`, and `.wrangler/`.

## Recommended Next Implementation Order

1. Verify UI interactions in browser against local Wrangler dev.
   - Dashboard refresh after writes.
   - Onboarding create and approve.
   - Customer portfolio details.
   - Manual transfer and product purchase.
   - Audit log entries.

2. Deploy and connect OpenClaw MCP.
   - Apply D1 migrations.
   - Seed remote data.
   - Deploy Worker.
   - Register MCP endpoint in OpenClaw.
   - Run Telegram demo script end to end.

3. Harden after demo validation.
   - Add fuller Worker API smoke tests.
   - Add MCP transport compatibility tests if OpenClaw requires SSE-specific behavior.
   - Add a repeatable reset/seed command for demo rehearsals.

## Do Not Change Without Reconfirming

- Do not move Telegram webhook handling into Cloudflare.
- Do not expose onboarding approval to the Telegram agent in v1.
- Do not add MCP authorization unless the demo scope is reconfirmed.
- Do not add full real KYC, tax, sanctions, or payment logic.
- Do not add complex multi-role auth in v1.
- Do not store original identity document images in the bank system.
