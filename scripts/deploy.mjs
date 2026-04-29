import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { readDotEnv } from "./wrangler-env.mjs";

const root = resolve(import.meta.dirname, "..");
const env = { ...process.env, ...readDotEnv(resolve(root, ".env")) };

if (!env.CLOUDFLARE_API_TOKEN) {
  console.error("CLOUDFLARE_API_TOKEN is missing. Add it to .env or set it in the current shell.");
  process.exit(1);
}

await run("vite", ["build"]);
await run("wrangler", ["deploy"]);

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      shell: process.platform === "win32",
      stdio: "inherit"
    });

    child.on("error", rejectRun);
    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}
