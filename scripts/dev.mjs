/**
 * Start API + Vite together without an extra package (disk-friendly).
 * Usage from repo root: node scripts/dev.mjs
 * Stops both when you Ctrl+C.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

const children = [];
let shuttingDown = false;

function start(name, cwd, args) {
  const child = spawn(node, args, {
    cwd: path.join(root, cwd),
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
    windowsHide: true,
  });
  children.push(child);

  const tag = (stream) => {
    stream.on('data', (buf) => {
      for (const line of buf.toString().split(/\r?\n/)) {
        if (line.length) process.stdout.write(`[${name}] ${line}\n`);
      }
    });
  };
  tag(child.stdout);
  tag(child.stderr);

  child.on('error', (err) => {
    console.error(`[${name}] failed to start:`, err.message);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${name}] exited (code=${code}, signal=${signal}) — stopping the other process`);
    shutdown(code ?? 1);
  });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try {
      if (!c.killed) c.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
  setTimeout(() => {
    for (const c of children) {
      try {
        if (!c.killed) c.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }
    process.exit(code);
  }, 1500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting AURVEXA API (5000) + Vite (5173). Ctrl+C stops both.');
start('api', 'backend', ['--watch', '--watch-path=./src', 'src/server.js']);
start('web', 'frontend', ['--max-old-space-size=2048', './node_modules/vite/bin/vite.js']);
