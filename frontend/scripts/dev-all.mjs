// Starts the backend API and the Next.js dev server together, so you can't
// forget to run one of them (a missing backend is what causes the
// "TypeError: Failed to fetch" on /auth/me). Run it with: npm run dev:all
//
// Ctrl+C stops both. No extra npm dependency -- just Node's child_process.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = resolve(frontendDir, "..", "backend");

// Prefer the project venv's Python; fall back to whatever `python` is on PATH.
const venvPython = process.platform === "win32"
  ? join(backendDir, "venv", "Scripts", "python.exe")
  : join(backendDir, "venv", "bin", "python");
const python = existsSync(venvPython) ? venvPython : (process.platform === "win32" ? "python" : "python3");

if (python !== venvPython) {
  console.warn(
    `\x1b[33m[dev:all] backend venv not found at ${venvPython} -- using "${python}" from PATH.\n` +
    `          If the API fails to start, create it: cd backend && python -m venv venv && ` +
    `venv\\Scripts\\pip install -r requirements.txt\x1b[0m`,
  );
}

const procs = [
  {
    name: "api",
    color: "\x1b[36m", // cyan
    cmd: python,
    args: ["-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
    cwd: backendDir,
  },
  {
    name: "web",
    color: "\x1b[32m", // green
    cmd: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "dev"],
    cwd: frontendDir,
  },
];

const children = procs.map(({ name, color, cmd, args, cwd }) => {
  const child = spawn(cmd, args, { cwd, stdio: ["inherit", "pipe", "pipe"] });
  const tag = `${color}[${name}]\x1b[0m `;
  const pipe = (stream, out) => {
    stream.setEncoding("utf8");
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk;
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) out.write(tag + line + "\n");
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on("exit", (code) => {
    process.stdout.write(tag + `exited with code ${code}\n`);
    shutdown(code ?? 0);
  });
  return child;
});

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  // Give them a moment to stop cleanly, then force exit.
  setTimeout(() => process.exit(code), 2000).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
