fetch('https://ai-bank-demo.refined-x.workers.dev/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
