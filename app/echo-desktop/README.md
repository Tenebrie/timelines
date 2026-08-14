# Neverkin Desktop

Standalone desktop mode: the full Neverkin stack (Rhea API, Calliope realtime, Styx frontend)
running as a single local process with an embedded database. No Docker, no Postgres, no Redis,
no S3, no network — a writer's data never leaves their machine.

## How it works

This package contains **zero forks of application code**. It boots the unmodified production
builds of Rhea and Calliope inside one Node process and substitutes their infrastructure at
well-defined seams:

| Docker deployment | Desktop mode | Mechanism |
|---|---|---|
| PostgreSQL server | PGlite (Postgres-in-WASM) in a local data dir | ESM loader hook: `@prisma/adapter-pg` → `src/adapter-pg-shim.mjs` |
| Redis server | In-process store + EventEmitter pub/sub, Lua via wasmoon | ESM loader hook: `redis` → `src/redis-shim.mjs` |
| Docker DNS (`rhea`, `s3-minio`, …) | `dns.lookup` remap to 127.0.0.1 | `src/dns-remap.mjs` |
| Gatekeeper nginx | Tiny local router: SPA + `/api` + `/live` (WS) on one origin | `src/router.mjs` |
| `prisma migrate deploy` | Migration replayer with `_prisma_migrations` bookkeeping | `src/migrate.mjs` |
| Docker secrets | Env defaults + per-install generated JWT secret | `src/launcher.mjs` |

Because PGlite is real Postgres, the entire Prisma schema (enums, arrays, BIGINT) and the full
migration history apply unchanged. Because both apps share one process, Redis pub/sub between
Rhea and Calliope reduces to an in-memory event bus with identical semantics, and the Yjs
leader-election Lua scripts run verbatim on an embedded Lua VM.

## Usage

```bash
# 1. Build every upstream artifact with its own unmodified pipeline
#    (rerun after every pull/merge — desktop mode needs no changes of its own)
npm run build:upstream

# 2a. Run as a desktop app
npm start

# 2b. Or run headless and open http://127.0.0.1:8190 in a browser
npm run start:headless

# 3. Produce a redistributable build (folder + archive) for THIS platform
npm run package
# -> dist/package/echo-desktop-<platform>-<arch>/         (runnable folder)
# -> dist/package/echo-desktop-<platform>-<arch>.zip|.tar.gz
```

The packaged folder is fully self-contained (~320 MB unpacked, ~125 MB
compressed): Electron runtime (single locale), the two backends as esbuild
bundles with the shims compiled in, the SPA build, the migrations, and the few
packages that must stay external (bcrypt native, PGlite/wasmoon WASM). sharp
and y-leveldb are stubbed out at bundle time — both serve features that are
disabled in desktop mode. The recipient just runs `./neverkin` (see the
README.txt inside; `--no-sandbox` fallback for some Linux setups). Native
modules and the Electron binary are taken from the local install, so stage
each target OS on that OS — e.g. run `npm run package` on a Windows machine to
get the Windows build. Linux and Windows are supported; macOS packaging is
not implemented yet (the Electron.app bundle needs its own treatment).

Size floor note: Electron alone is ~250 MB unpacked, so this architecture
cannot go below that. The path to a drastically smaller package is swapping
the shell for a system-webview wrapper (Tauri-style) with a Node sidecar for
the services — the launcher/bundles are already shell-agnostic.

Data lives in `~/.neverkin` (override with `NEVERKIN_DESKTOP_DATA`). Port defaults to
`8190` (`NEVERKIN_DESKTOP_PORT`). New migrations merged from other branches are applied
automatically on next launch. Console output is mirrored to `<data dir>/log.txt`, so shim
drift warnings and crashes survive in packaged builds where nobody sees a console.

### Single-connection concurrency

PGlite is single-connection, so the adapter shim adds two behaviors a pooled
Postgres never needed: interactive transactions are serialized through a FIFO
gate before reaching PGlite, and queries issued on the main client while a
transaction is open are routed into that transaction (on a pooled server they
would run on a separate connection; on PGlite they would deadlock — Rhea's
`updateActor` does exactly this via `makeTouchWorldQuery(worldId)` without the
tx client). Prisma's interactive-transaction limits are raised to 30s via a
loader-hook wrapper around the generated client. Verified with ~80 concurrent
writes/reads per burst: zero failures, sub-second completion.

## Maintenance contract

- **Kept automatically by design:** new entities, routes, migrations, frontend features —
  everything that flows through Prisma, the REST API, or the existing Redis command surface.
- **The one drift point:** if upstream code starts using a Redis command the shim does not
  implement, the call rejects with an `unimplemented client method` error naming the command.
  Extend `redis-shim.mjs` (usually a few lines) when that happens. Beta error policy applies
  throughout: escaped errors show a system dialog and exit — a crash is recoverable, silently
  degraded or corrupted state is not.
- **EVAL runs on a pure-JS Lua-subset interpreter** (redis.call statements, locals, if/then,
  `==`, tonumber, return — covers all upstream scripts). Scripts outside the subset fall back
  to wasmoon with a loud warning. Do NOT move wasmoon back onto the hot path: sustained
  WASM-Lua invocation segfaults Electron's V8 (SIGSEGV, reproduced and fixed 2026-08-13);
  extend the JS interpreter instead.

## Scope / known limitations (POC)

- **Asset/image upload is disabled** (`/bucket` returns 501; S3 gets dummy config and fails
  fast). Production path: bundle a filesystem-backed S3 shim or a MinIO binary.
- **Google login does not work** offline (its iframe flow assumes the `app.` subdomain
  deployment). Email/password and guest auth work fully. The local router serves an inert
  page at `/google-signin.html` — under the SPA fallback the sign-in iframe would embed
  the whole app recursively and steal keyboard focus on the login page. Note the same
  recursion exists upstream on any origin without the `app.` prefix (localhost, staging).
- Icon search (Iconify) and Google Fonts require network; both degrade gracefully offline.
- Rhea/Calliope bind their hardcoded ports 3000/3001 on all interfaces; a hardened build
  should firewall or patch them to loopback.
- Builds are unsigned (Windows SmartScreen / macOS Gatekeeper will complain) and there is
  no installer or auto-update — the package is a plain runnable folder.
