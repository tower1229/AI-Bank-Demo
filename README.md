# AI Bank Demo

Demo project for operating a simulated private banking system through Telegram natural language via OpenClaw and MCP.

## Current Baseline

The confirmed v1 direction is documented before implementation:

- [Agent guide](AGENTS.md)
- [Requirements](docs/requirements.md)
- [Development guide](docs/development.md)
- [Project handoff](docs/handoff.md)
- [OpenClaw agent instructions](docs/openclaw-agent-instructions.md)
- [Demo script](docs/demo-script.md)
- [Deployment notes](docs/deployment.md)
- [Setup preparation checklist](docs/setup-preparation.md)

## Architecture

OpenClaw owns the Telegram bot directly. Cloudflare hosts the simulated bank web console, API, D1 database, and MCP endpoint.

```text
Telegram DM
  -> OpenClaw Gateway
  -> ai-bank agent
  -> Bank MCP on Cloudflare
  -> shared bank service layer
  -> Cloudflare D1
```

The web console and MCP tools must reuse the same banking service layer so manual operations and AI-assisted operations produce consistent data and audit logs.

## Development State

This repository has the Phase 1 scaffold implemented: Cloudflare Worker, React/Vite console, D1 migration, seed SQL, and read-only dashboard APIs.

Local secrets belong in `.env` or `.dev.vars`; use `.env.example` as the template and never commit real tokens.

## Local Run

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
