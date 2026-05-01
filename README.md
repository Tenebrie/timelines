<p align="center">
  <a href="https://neverkin.com/">
    <img src="docs/images/neverkin-logo-title-dark.webp" alt="Neverkin Logo" width="400"><br>
  </a>
</p>

# Introduction

[![Build & Test](https://github.com/Tenebrie/timelines/actions/workflows/pullRequest.yml/badge.svg)](https://github.com/Tenebrie/timelines/actions/workflows/pullRequest.yml)
[![Deploy](https://github.com/Tenebrie/timelines/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tenebrie/timelines/actions/workflows/deploy.yml)

Neverkin is an open-source collaborative writing and worldbuilding app for storytellers, DMs, writers and novelists. Organize timelines, characters, lore, and interconnected stories online in real-time.

Formerly known internally as Timelines, which is a name still used across the repository.

## Live Deployments

- **Production**: https://neverkin.com/
  - Manually deployed stable release
- **Staging**: https://staging.neverkin.com/
  - Hot updated directly from the `dev` branch

## Architecture

The application is built using the microservice architecture for Docker Swarm. The following diagram illustrates the main moving parts:

![Architecture Diagram](docs/images/architecture.jpg)

### Frontend (Styx)
- **[React](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vitejs.dev/)**
- **[TanStack Router](https://tanstack.com/router)**
- **[Redux Toolkit](https://redux-toolkit.js.org/)** + **[RTK Query](https://redux-toolkit.js.org/rtk-query/overview)**
- **[Material UI](https://mui.com/)**
- **[Tiptap](https://tiptap.dev/)**

### Backend (Rhea & Calliope)
- **[Koa.js](https://koajs.com/)**
- **[Prisma ORM](https://www.prisma.io/)**
- **[PostgreSQL](https://www.postgresql.org/)**
- **[Moonflower](https://github.com/tenebrie/moonflower)**
- **[Redis](https://redis.io/)**

### Proxy (Gatekeeper)
- **[Nginx](https://nginx.org/)**

### Infrastructure
- **[Docker](https://www.docker.com/)** + **[Docker Swarm](https://docs.docker.com/engine/swarm/)**
- **[Nginx](https://nginx.org/)**

# Running the app

The development environment requires Node, Yarn and Docker to run.

In most cases, the following commands are enough to have the entire environment up and running:

- `yarn` <!-- Install dependencies -->
- `yarn dev` <!-- Run dev environment through Docker -->

The migrations are run automatically via a docker-compose task on environment start-up.

The default admin user is `admin@localhost` with password `q`.

## Useful commands

For a quick update on a running environment after a dependency update, change to Prisma types, creating a new migration, change to tsconfig.json or another change to package.json, you can either just restart the containers, or use the following:

```sh
yarn docker:update
```

> Note: The containers should be running for this command to work.

---

In case of issues with containers, try a full rebuild without cache:

```sh
yarn docker:build
```

# Connecting to MCP server

Neverkin provides a hosted MCP server - named Orpheus - that allows your preferred flavor of AI assistant to interact with your worlds to search, read, create and update your notes. Orpheus exposes a curated subset of Neverkin features. Their presentation is tailored to how LLMs prefer to interact with external tools, which differs quite significantly from the tools you see in the UI. You don't need to run anything locally if you're using the official Neverkin web version.

> It's best to avoid editing the same notes the AI is currently working on as it may override either side's changes. See technical explanation below for more detail.

To access the MCP server, simply point your AI to the URL:

```
https://app.neverkin.com/mcp
```

The MCP server supports the full OAuth flow that is invisible to your agent. Depending on your AI provider, you will be asked to authenticate with a Neverkin account before the AI can access your data. Your email, username or password is never exposed to the AI agent, but all your world and calendar data within Neverkin is.

> Exercise caution when working with AI. Modern AI is powerful, yet unreliable. It's recommended to create a separate user account for your agent and invite it to a designated AI-driven world as a collaborator. Take regular backups.

## Implementation details

# Technical support

If you encounter trouble, reach out to the developer through the Discord link you can find on the Feedback page in the application. In case of catastrophic data loss, your work can be recovered. However, you are still encouraged to create your own backups.

> A database backup is taken every 6 hours

## Self-hosting the app

You are explicitly allowed to self-host Neverkin for your own needs. Refer to [Creating New Cluster](docs/Creating%20New%20Cluster.md) for full technical breakdown on hosting a full Docker Swarm cloud. For local work, `yarn dev` will likely be enough.
