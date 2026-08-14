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
| Redis server | In-process store + EventEmitter pub/sub, Lua via fengari | ESM loader hook: `redis` → `src/redis-shim.mjs` |
| S3/MinIO server | Filesystem-backed S3 subset on virtual port 9000 (SDK + presigned uploads/downloads) | `src/s3-shim.mjs` |
| Docker DNS (`rhea`, `s3-minio`, …) | `dns.lookup` remap to 127.0.0.1 | `src/dns-remap.mjs` |
| Fixed service ports (`:3000`, `:3001`) | Virtualized: random free loopback ports, outgoing calls rewritten to match | `src/port-remap.mjs` |
| Gatekeeper nginx | Tiny local router: SPA + `/api` + `/live` (WS) on one origin | `src/router.mjs` |
| `prisma migrate deploy` | Migration replayer with `_prisma_migrations` bookkeeping | `src/migrate.mjs` |
| `prisma db seed` | Seed replica: default Admin account (admin@localhost / q), DatabaseSeeded-guarded | `src/migrate.mjs` |
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
#    (if 8190 is taken, a random free port is picked and printed)
npm run start:headless

# 3. Produce a redistributable build (folder + archive) for THIS platform
npm run package
# -> dist/package/echo-desktop-<platform>-<arch>/         (runnable folder)
# -> dist/package/echo-desktop-<platform>-<arch>.zip|.tar.gz
```

The packaged folder is fully self-contained (~340 MB unpacked, ~135 MB
compressed): Electron runtime (single locale), the two backends as esbuild
bundles with the shims compiled in, the SPA build, the migrations, and the few
packages that must stay external (bcrypt and sharp native — platform-matched
prebuilds only — plus PGlite WASM). y-leveldb is stubbed out at bundle time;
sharp loads through a wrapper that falls back to a header-parsing stub if the
native module cannot load. The recipient just runs `./neverkin` (see the
README.txt inside; `--no-sandbox` fallback for some Linux setups). Native
modules and the Electron binary are taken from the local install, so stage
each target OS on that OS — e.g. run `npm run package` on a Windows machine to
get the Windows build. Linux and Windows are supported; macOS packaging is
not implemented yet (the Electron.app bundle needs its own treatment).

Size floor note: Electron alone is ~250 MB unpacked, so this architecture
cannot go below that. The path to a drastically smaller package is swapping
the shell for a system-webview wrapper (Tauri-style) with a Node sidecar for
the services — the launcher/bundles are already shell-agnostic.

Data lives in the platform's user-data location (override with `NEVERKIN_DESKTOP_DATA`):
`$XDG_DATA_HOME/neverkin` (default `~/.local/share/neverkin`) on Linux,
`%LOCALAPPDATA%\Neverkin` on Windows, `~/Library/Application Support/Neverkin` on macOS.
Port defaults to `8190`
(`NEVERKIN_DESKTOP_PORT`). New migrations merged from other branches are applied
automatically on next launch. Console output is mirrored to `<data dir>/log.txt`, so shim
drift warnings and crashes survive in packaged builds where nobody sees a console; the log
rotates to `log.prev.txt` past 5 MB, with a 20 MB per-session cap as a runaway backstop.

### Single-connection concurrency

PGlite is single-connection, so the adapter shim adds two behaviors a pooled
Postgres never needed: interactive transactions are serialized through a FIFO
gate before reaching PGlite (queries from other requests simply queue on
PGlite's internal mutex until the transaction commits), and a main-client
query issued from *inside* a `$transaction` callback fails loudly — by
contract that is an upstream bug: it silently escapes atomicity on pooled
Postgres and self-deadlocks on PGlite. The client wrapper marks interactive
callbacks via AsyncLocalStorage so the adapter can raise an immediate,
actionable error (this detector caught and led to the `deleteEventTrack`
fix). Prisma's interactive-transaction limits are raised to 30s via the same
wrapper. Verified with 240 mixed concurrent transactions/reads per run: zero
failures, sub-second completion.

## Maintenance contract

- **Kept automatically by design:** new entities, routes, migrations, frontend features —
  everything that flows through Prisma, the REST API, or the existing Redis command surface.
- **Ports:** Rhea/Calliope's hardcoded ports are virtualized to random loopback ports
  (`port-remap.mjs`), so the desktop app coexists with the docker dev stack. If a service
  ever hardcodes a NEW port, add it to the `installPortRemap` list in `launcher.mjs`.
- **The one drift point:** if upstream code starts using a Redis command the shim does not
  implement, the call rejects with an `unimplemented client method` error naming the command.
  Extend `redis-shim.mjs` (usually a few lines) when that happens. Beta error policy applies
  throughout: escaped errors show a system dialog and exit — a crash is recoverable, silently
  degraded or corrupted state is not.
- **EVAL runs on fengari**, a complete Lua VM in pure JavaScript — upstream scripts run
  verbatim, no subset restrictions. Do NOT swap in a WASM-based Lua runtime: sustained
  WASM-Lua invocation segfaults Electron's V8 (SIGSEGV, reproduced with wasmoon 2026-08-13),
  and EVAL sits on the per-keystroke Yjs path.

## Scope / known limitations (POC)

- Asset upload/download, image conversion and data import/export all work fully
  (filesystem-backed S3 shim, objects in `<data dir>/s3`; native sharp ships in the
  package). If sharp cannot load on an unusual system, the app still boots — a
  header-parsing fallback keeps uploads working and only conversion is disabled.
- **Google login does not work** offline (its iframe flow assumes the `app.` subdomain
  deployment). Email/password and guest auth work fully. The local router serves an inert
  page at `/google-signin.html` — under the SPA fallback the sign-in iframe would embed
  the whole app recursively and steal keyboard focus on the login page. Note the same
  recursion exists upstream on any origin without the `app.` prefix (localhost, staging).
- Icon search (Iconify) and Google Fonts require network; both degrade gracefully offline.
- Builds are unsigned (Windows SmartScreen / macOS Gatekeeper will complain) and there is
  no installer or auto-update — the package is a plain runnable folder.
