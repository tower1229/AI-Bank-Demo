# Deployment Notes

## Target Architecture

Use Cloudflare for the bank demo and the existing cloud server for OpenClaw.

```text
Telegram DM
  -> OpenClaw Gateway Telegram channel
  -> ai-bank OpenClaw agent
  -> remote Bank MCP endpoint on Cloudflare
  -> shared bank service layer
  -> Cloudflare D1

Bank web console
  -> Cloudflare Worker API
  -> same bank service layer
  -> Cloudflare D1
```

OpenClaw should own the Telegram bot directly. Do not add a Cloudflare Telegram webhook in v1.

## Cloudflare Components

Planned components:

- Cloudflare Worker for API and MCP endpoints.
- Cloudflare D1 for persistent demo data.
- Vite-built React static assets served by the Worker or Cloudflare Pages.

Expected endpoints:

- `/api/*` for the web console.
- `/mcp` for remote MCP access.
- Static frontend routes for the web console.

## OpenClaw Telegram Setup

Create a new bot with BotFather and register it as a dedicated Telegram account in OpenClaw.

Example:

```bash
openclaw channels add \
  --channel telegram \
  --account ai-bank-demo \
  --name "AI Bank Demo Bot" \
  --token "$TELEGRAM_BOT_TOKEN"
```

Configure the Telegram channel for open DM usage in the OpenClaw config:

```js
{
  channels: {
    telegram: {
      enabled: true,
      dmPolicy: "open",
      allowFrom: ["*"]
    }
  }
}
```

v1 uses Telegram DM only. Group chat support is out of scope.

## OpenClaw Agent Setup

Create a dedicated `ai-bank` agent rather than using the default agent.

Example shape:

```js
{
  agents: {
    list: [
      {
        id: "ai-bank",
        name: "AI Bank Demo",
        workspace: "~/.openclaw/workspace-ai-bank"
      }
    ]
  },
  bindings: [
    {
      agentId: "ai-bank",
      match: {
        channel: "telegram",
        accountId: "ai-bank-demo"
      }
    }
  ]
}
```

Copy or adapt `docs/workspace/IDENTITY.md`, `docs/workspace/AGENTS.md`, and `docs/workspace/TOOLS.md` into the `ai-bank` agent's system instructions or workspace guidance.

## MCP Registration

Register the Cloudflare-hosted bank MCP endpoint in OpenClaw.

Streamable HTTP example:

```bash
openclaw mcp set ai-bank '{
  "url": "https://<bank-demo-domain>/mcp",
  "transport": "streamable-http"
}'
```

SSE/HTTP may also be used if the runtime adapter requires it:

```bash
openclaw mcp set ai-bank '{
  "url": "https://<bank-demo-domain>/mcp"
}'
```

The exact MCP transport must be verified against the running OpenClaw server.

## Security Boundary

This is a public demo bot. The bank MCP endpoint is intentionally unauthenticated in v1 to keep the demo focused on business operations rather than auth.

Recommended v1 boundaries:

- Telegram bot is public.
- OpenClaw Gateway is not exposed as a public unauthenticated HTTP endpoint.
- Bank MCP uses the built-in demo operator account and does not require an authorization header.
- Bank API may be public for the demo web console but must only operate on demo data.
- No real personal data or real financial data should be entered.

## Local Development Flow

Expected local flow after implementation:

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Expected validation before deploy:

```bash
npm run typecheck
npm run test
npm run build
```

## Cloudflare Deployment Flow

Expected deployment flow after implementation:

```bash
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
```

After deploy:

1. Open the web console URL.
2. Confirm seed data is visible.
3. Confirm `/api` health check works.
4. Confirm MCP tool listing works from OpenClaw.
5. Send a Telegram DM to the AI Bank Demo bot.
6. Run one create application flow, one transfer, and one product purchase.

## Open Items for Implementation

- Verify the exact MCP transport against the running OpenClaw server.
- Add remote D1 migration and seed scripts if the deployment target needs separate commands.
- Run the Telegram demo script end to end after registering the deployed MCP endpoint.
