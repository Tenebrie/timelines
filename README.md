# Introduction

Timelines is a worldbuilding and storytelling web application focused on the needs of writers, note-takers and anyone who finds it hard to keep track of the events in their fictional - or less so - worlds.

## Live Deployments

- **Production**: https://timelines.tenebrie.com/
  - Manually deployed stable release
- **Staging**: https://staging.tenebrie.com/
  - Hot updated directly from the `dev` branch

## Technologies

The application is built with a (suggestion of) microservice architecture using the following technologies:

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

For a quick update on a running environment after a dependency update, change to Prisma types, creating a new migration, change to tsconfig.json or another change to package.json, use the following:

```sh
yarn docker:update
```

> Note: The containers should be running for this command to work.

---

To bring an older environment up-to-speed, or when something goes wrong, use the following command:

```sh
yarn docker:fullinstall
```
