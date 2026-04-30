# AI Bank Demo Agent Guide

## Project Mission

Build a demo where a private bank relationship manager uses Telegram natural language through OpenClaw to operate a simulated private banking system. The system must show real persistent demo data changes for onboarding applications, internal USD transfers, and investment product purchases.

## Current Status

The repository has a working vertical demo slice: shared bank service layer, Cloudflare Worker API routes, unauthenticated demo MCP tools, D1 persistence, smoke tests, and a React web console for onboarding, approval, transfers, product purchases, customer portfolios, and audit logs.

## Source of Truth

Read these first:

- `docs/requirements.md`: confirmed product and architecture contract.
- `docs/workspace/IDENTITY.md`, `docs/workspace/AGENTS.md`, and `docs/workspace/TOOLS.md`: behavior contract for the `ai-bank` OpenClaw agent.
- `docs/demo-script.md`: target demo flow and failure cases.
- `docs/deployment.md`: target Cloudflare and OpenClaw deployment shape.
- `docs/setup-preparation.md`: Telegram, Cloudflare, and OpenClaw preparation checklist.
- `docs/development.md`: cross-device development setup.
- `docs/ui-guidelines.md`: frontend UI design specification and styling rules.
- `docs/handoff.md`: current progress and next implementation steps.

## Confirmed Architecture

OpenClaw owns the Telegram bot directly. Cloudflare hosts the bank web console, API, D1 database, and MCP endpoint.

```text
Telegram DM -> OpenClaw Gateway -> ai-bank agent -> Cloudflare Bank MCP -> shared bank service layer -> Cloudflare D1
```

The web console and MCP tools must call the same bank service layer. Do not implement separate business logic for manual web operations and AI-assisted operations.

## Key Product Rules

- Telegram represents a private bank relationship manager, not an end customer.
- Telegram DM is public for the demo; no whitelist in v1.
- Telegram/OpenClaw can submit onboarding applications but cannot approve them.
- Onboarding approval happens in the bank web console.
- Transfers and product purchases execute directly after confirmation.
- Every write operation requires second confirmation.
- v1 supports USD only.
- v1 supports internal account-to-account transfers only.
- Identity document images are parsed by OpenClaw when possible; the bank system stores structured fields, not original images.
- The web console must support manual operations, not only read-only observation.

## Implementation Constraints

- Use TypeScript throughout.
- Target Cloudflare Worker + D1 + React/Vite.
- Keep `src/bank` as the shared service layer once implementation begins.
- Prefer business-action MCP tools over low-level CRUD tools.
- MCP is a demo-internal endpoint in v1 and intentionally does not implement authorization.
- Keep secrets out of git. `.env` and `.dev.vars` are local only.

## Secrets

Do not read, print, or commit real tokens. Use `.env.example` as the tracked template.

Known local-only secrets include:

- `TELEGRAM_BOT_TOKEN`
- Cloudflare account credentials
- OpenClaw gateway/auth tokens

## Next Work

Start implementation from `docs/handoff.md`, not from memory or chat history.
