# Development Guide

## Purpose

This document makes the project portable across devices. A new machine or future agent should be able to recover the current intent from repository files without relying on chat history.

## Fresh Checkout

```bash
git clone <repo-url> AI-Bank-Demo
cd AI-Bank-Demo
```

Read in order:

```text
AGENTS.md
docs/requirements.md
docs/handoff.md
docs/setup-preparation.md
docs/openclaw-agent-instructions.md
docs/demo-script.md
docs/deployment.md
```

## Local Secrets

Create local environment files from the template:

```bash
cp .env.example .env
```

When Cloudflare Worker development starts, also create:

```bash
cp .env.example .dev.vars
```

Fill in local values:

- `BANK_MCP_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`

Never commit `.env` or `.dev.vars`.

## Cloudflare Preparation

Install/login through Wrangler when needed:

```bash
npx wrangler@latest login
npx wrangler@latest whoami
```

Create the D1 database if it does not already exist:

```bash
npx wrangler@latest d1 create ai-bank-demo-db
```

Store the returned `database_id` locally and later in `wrangler.toml`.

Generate the MCP shared secret:

```bash
openssl rand -hex 32
```

After the Worker exists, set the remote secret:

```bash
npx wrangler@latest secret put BANK_MCP_SECRET
```

## OpenClaw Preparation

OpenClaw runs on the existing cloud server. The repo does not own that runtime config, but the desired setup is:

- Agent id: `ai-bank`
- Telegram account id: `ai-bank-demo`
- Telegram DM policy: open
- Group chat: disabled for this bot
- Agent instruction source: `docs/openclaw-agent-instructions.md`

Validate on the server:

```bash
openclaw channels list
openclaw channels status --probe
openclaw agents list --bindings
openclaw logs --follow
```

The Telegram bot has already been tested enough to show that OpenClaw receives DM messages and replies with the AI Bank Demo persona. MCP tool connectivity is not yet implemented.

## Phase 1 Commands

These scripts exist after the Phase 1 scaffold:

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run db:migrate:local
npm run db:seed:local
npm run dev
npm run deploy
```

Recommended local order:

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Then open:

```text
http://localhost:8787
```

Useful read-only endpoints:

```text
GET /api/health
GET /api/seed/status
GET /api/dashboard
```

The `/mcp` endpoint is intentionally a Phase 2 placeholder and returns `501`.

## Working Tree Hygiene

- `.env` was removed from git tracking and is local-only.
- `.wrangler/` is local Cloudflare state and is ignored.
- `dist/` and `node_modules/` are generated locally and ignored.
- Do not commit real tokens or generated local state.
- Prefer documenting durable decisions in `docs/handoff.md` or the specific design doc instead of leaving them only in chat.
