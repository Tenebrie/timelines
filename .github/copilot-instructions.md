# Timelines - AI Context & Architecture Guide

**Last Updated**: December 29, 2025  
**Project**: Collaborative worldbuilding and timeline management application

## 🎯 Project Purpose

Timelines is a collaborative web application for writers, game masters, and worldbuilders to organize complex fictional universes. Think of it as a project management tool specifically designed for creative fiction - managing characters, events, timelines, lore, and their interconnections.

## 🏛️ Architecture Overview

### Service Layer (Greek Mythology Theme)

```
┌─────────────────────────────────────────────────────────────┐
│  Gatekeeper (Nginx)                                         │
│  Reverse proxy handling routing & SSL                       │
└────┬────────────────────────────┬───────────────────────────┘
     │                            │
     ▼                            ▼
┌─────────────┐            ┌─────────────────┐
│ Styx        │            │ Calliope        │
│ Frontend    │◄──────────►│ WebSockets      │
│ React SPA   │  WSS       │ Real-time sync  │
└──────┬──────┘            └────────┬────────┘
       │                            │
       │ REST API                   │ Redis Pub/Sub
       ▼                            ▼
┌─────────────────────────────────────┐
│ Rhea Backend                        │
│ Koa.js REST API + Prisma ORM        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────┐
│ PostgreSQL      │
│ Primary DB      │
└─────────────────┘
```

**Services:**

- **Styx** (Frontend): React 19 + TypeScript + Vite + TanStack Router + Material-UI + Redux Toolkit
- **Rhea** (Backend): Koa.js REST API + Prisma ORM + PostgreSQL + Moonflower OpenAPI
- **Calliope** (WebSockets): Real-time collaboration service using Koa WebSockets + Redis
- **Gatekeeper** (Proxy): Nginx reverse proxy for routing and SSL termination
- **ts-shared**: Shared TypeScript types and utilities between all services

### Monorepo Structure

- Yarn workspaces managing all packages
- Docker-based development and production deployment
- OpenAPI code generation for type-safe frontend API consumption
- Prisma for database schema and migrations

## 📊 Core Domain Model

### Hierarchy

```
User
 └─► World (Project/Setting) ← Top-level container
      ├─► Events (Timeline items with timestamps)
      │    ├─► WorldEventTrack (Visual grouping/storylines)
      │    └─► WorldEventDelta (Revisions/updates to events)
      ├─► Actors (Characters/entities/locations/objects)
      │    └─► MindmapNode (Visual positioning data)
      ├─► WikiArticles (Lore/notes/documentation)
      │    └─► Hierarchical tree structure
      └─► Tags (Custom categorization)
```

### Key Concepts

**World**

- The top-level organizational unit - a "project" or "setting"
- Contains all entities: Events, Actors, Wiki articles, Tags
- Nothing can escape a World - all entities are World-specific
- Can be Private, PublicRead, or PublicEdit
- Owner + optional collaborators (ReadOnly or Editing access)
- Has a calendar type (COUNTUP, EARTH, PF2E, RIMWORLD, EXETHER)
- **Use case**: If you're writing 5 interconnected stories in the same universe → 1 World. Two unrelated settings → 2 Worlds.

**WorldEvent**

- Something that happens and affects the world or actors
- **Always** has a `timestamp` (BigInt for precision)
- May have a `revokedAt` timestamp (after which it's hidden and doesn't affect the world)
- Can have a duration (timestamp → revokedAt)
- Assigned to a `WorldEventTrack` for visual grouping
- Types: SCENE, OTHER
- Supports deltas for updates (see below)

**WorldEventTrack**

- Visual grouping mechanism for events on the timeline
- Think: different storylines, POV characters, parallel plots, thematic groups
- Has position and visibility controls
- **Example**: "Main Plot", "Character A's Journey", "Background Events"

**WorldEventDelta**

- A revision/update to an existing event
- **Use case**: Instead of revoking and creating new event when something changes
- **Example**: "10 Undead Kings invading" → update to "9 Undead Kings invading" after one dies
- Has its own timestamp for when the change occurs
- Can override name, description, descriptionRich
- **Note**: This is an older concept that needs significant updates

**Actor**

- Any entity with presence in the world: characters, organizations, locations, objects, concepts
- Can have relationships to other Actors (visualized in Mindmap)
- Has icon, color, name, title, descriptions (plain and rich text)
- Can be mentioned in Events, Wiki articles, and other Actors
- Each Actor can have a MindmapNode for visual positioning

**WikiArticle**

- Lore, notes, documentation, game rules, whatever you need to write down
- Hierarchical structure (parent/children relationships)
- Supports rich text content
- Can mention and be mentioned by any entity (Actors, Events, other Articles, Tags)
- Has position field for ordering within parent

**Tag**

- Custom categorization system
- Can be mentioned in any entity type
- Lightweight way to group related content

**Mention System**

- Cross-referencing between all entity types
- Bidirectional relationships tracked in `Mention` table
- Supports: Actor ↔ Event ↔ WikiArticle ↔ Tag (any to any)
- Powers navigation and relationship visualization

**Mindmap**

- Visual view for Actors (Timeline is for Events, Mindmap is for Actors)
- Think: cards on a blackboard with connecting relationship lines
- Currently a work-in-progress feature
- MindmapNode stores positioning (x, y) for each Actor

**Calendar/Time System**

- Multiple calendar types supported (COUNTUP, EARTH, PF2E, RIMWORLD, EXETHER)
- Events use BigInt timestamps for precision
- **Known Issue**: Current calendar system needs major rework to support fully custom time definitions
- **Planned**: "Calendar v3" - fully customizable days/hours/months/labels for fictional worlds
- Timeline view is tightly coupled to calendar, making this refactor complex

## 👥 User & Access Control

**User Levels:**

- **Free**: Standard users
- **Premium**: Enhanced features (specifics TBD)
- **Admin**: System administrators

**World Access:**

- **Private**: Only owner and invited collaborators
- **PublicRead**: Anyone can view, only collaborators can edit
- **PublicEdit**: Anyone can view and edit

**Collaboration:**

- Owner invites collaborators to their World
- Collaborators have **ReadOnly** or **Editing** access
- Real-time collaboration via WebSockets (Calliope)
- Multiple users can edit simultaneously
- State syncs across all connected clients/tabs

## 🔄 Real-Time Collaboration (Calliope)

**What Syncs:**

- Entity state changes (Events, Actors, Wiki articles, etc.)
- When a user modifies an entity, all other connected users receive updates
- Keeps all tabs/users in sync

**How It Works:**

- WebSocket connection per user session
- JWT authentication via cookie
- Redis pub/sub for message distribution between Calliope instances
- Messages typed via `ClientToCalliopeMessage` / `CalliopeToClientMessage`

**Current Limitations:**

- Tiptap rich text editor collaboration is somewhat problematic
- Not yet Google Docs-level simultaneous editing
- Better than fully isolated state, but conflicts can occur

**Key Message Types:**

- `WORLD_SUBSCRIBE` / `WORLD_UNSUBSCRIBE`: Join/leave World updates
- Various entity update messages propagated to all subscribers

## 🛠️ Development Patterns

### Tech Stack Details

**Frontend (Styx):**

- React 19 with TypeScript
- TanStack Router (v1) for routing with generated route tree
- Redux Toolkit + RTK Query for state management
- Material-UI (MUI) v7 for components
- Tiptap for rich text editing
- Vite for bundling
- Vitest for testing
- OpenAPI code generation via RTK Query codegen

**Backend (Rhea):**

- Koa.js web framework
- Prisma ORM with PostgreSQL
- Moonflower for OpenAPI spec generation
- JWT authentication via cookies
- bcrypt for password hashing
- AWS S3 (or MinIO in dev) for asset storage
- Vitest for testing

**WebSockets (Calliope):**

- Koa WebSocket middleware
- Redis for pub/sub between instances
- JWT token validation
- Message routing to subscribed users

### File Organization Patterns

**Frontend:**

- `/src/app/features/` - Feature-based organization (auth, modals, richTextEditor, etc.)
- `/src/app/views/` - Main view components (world, timeline, etc.)
- `/src/api/` - Generated API client from OpenAPI
- `/src/routes/` - TanStack Router route definitions
- `/src/ui-lib/` - Reusable UI components
- `/ts-shared/` - Symlinked shared types

**View Structure Convention:**

Each view folder should follow this structure:

- `ViewName.tsx` - The main view component (small top-level wrapper)
- `components/` - Child components used by this view (one file per component)
- `hooks/` - Custom hooks specific to this view
- `utils/` - Utility functions specific to this view

Example:

```
/src/app/views/home/
├── HomeView.tsx           # Main view wrapper
├── components/
│   ├── DashboardHeader.tsx
│   ├── SummaryCard.tsx
│   └── RecentActivitySection.tsx
├── hooks/
│   └── useRecentActivity.ts
└── utils/
    └── formatTimeAgo.ts
```

**Backend:**

- `/src/routers/` - Koa routers (ActorRouter, WorldRouter, etc.)
- `/src/services/` - Business logic services
- `/src/schema/` - Zod validation schemas
- `/src/prisma/` - Database utilities and seed data
- `/src/utils/` - Helper functions
- `/ts-shared/` - Symlinked shared types

### Common Workflows

**Adding a New Entity Type:**

1. Define Prisma schema in `/app/rhea-backend/prisma/schema/`
2. Run migration: `yarn prisma migrate dev`
3. Create Zod validation schema in `/app/rhea-backend/src/schema/`
4. Create Koa router in `/app/rhea-backend/src/routers/`
5. Register router in `/app/rhea-backend/src/index.ts`
6. Generate OpenAPI: `yarn openapi`
7. Use generated API hooks in frontend

**Running the App:**

```bash
yarn                          # Install dependencies
yarn docker                   # Start all services
yarn prisma migrate dev       # Run migrations
```

**Quick Update (app running):**

```bash
yarn docker:update            # Rebuild containers with changes
```

**Full Reinstall:**

```bash
yarn docker:fullinstall       # Nuclear option when things break
```

### Testing

- **Unit/Integration**: `yarn test` (runs styx + rhea tests)
- **Frontend**: `yarn test:styx`
- **Backend**: `yarn test:rhea`
- **E2E**: `yarn test:e2e` (Playwright tests in `/test/e2e`)

## 🚀 Deployment

**Environment:**

- Docker Swarm on DigitalOcean droplet
- Can run on any Docker Swarm installation
- Can run locally in development mode
- Production build: `yarn docker:prod:push`

**Services in Production:**

- Postgres database with persistent volume
- Redis for WebSocket pub/sub
- S3-compatible storage (MinIO in dev, AWS S3 in prod)
- Nginx with SSL termination (Certbot for Let's Encrypt)

## 🎨 Design Philosophy

**Naming Conventions:**

- Greek mythology theme for service names
- Clear, descriptive component names
- Consistent file structure across packages

**Type Safety:**

- End-to-end TypeScript
- Prisma-generated types from database
- OpenAPI-generated API client types
- Zod validation schemas mirror Prisma models

**Code Style:**

- ESLint + Prettier enforced
- Absolute imports preferred (via path aliases)
- React hooks for state management
- Functional components only

## 🤖 AI Assistant Guidelines

**When Working on This Codebase:**

0. **Linter policy**: Treat TypeScript errors as CRITICAL errors. Always ensure code is type-safe. Always treat ESLint errors as important and fix them. Ignore Prettier formatting issues only - they will be auto-fixed.

1. **Always remember**: World is the top-level container. All entities belong to a World and cannot escape it.

2. **For database changes**: Update Prisma schema first, then run migration, then update application code.

3. **For API changes**: Update backend router → regenerate OpenAPI → use new types in frontend.

4. **For new features**: Consider whether it needs real-time sync via Calliope.

5. **Type safety**: Never use `any`. Use Prisma types, generated API types, or define proper interfaces. Avoid type assertions.

6. **Testing**: Add tests for business logic. E2E tests for user-facing features.

7. **Mentions**: If adding an entity that can reference others, integrate with the Mention system.

8. **Calendar awareness**: Be careful with timestamp calculations - the calendar system is complex and fragile.

9. **Access control**: Always check World ownership and collaborator permissions for mutations.

10. **Real-time updates**: If modifying entity state, ensure WebSocket messages propagate changes to other clients.

## 🔍 Troubleshooting

**Common Issues:**

- **Docker containers won't start**: Try `yarn docker:fullinstall`
- **Prisma types out of sync**: Run `yarn prisma generate`
- **Frontend API types outdated**: Run `yarn openapi`
- **Database migration issues**: Check migration files in `/app/rhea-backend/prisma/migrations/`
- **WebSocket not connecting**: Check Calliope logs and Redis connection

## 📚 Key Dependencies

**Notable Libraries:**

- **TanStack Router**: File-based routing with type-safe parameters
- **RTK Query**: Auto-generated API hooks from OpenAPI
- **Moonflower**: OpenAPI spec generation from TypeScript types
- **Tiptap**: Rich text editor with collaboration support
- **Prisma**: Type-safe database ORM
- **Zod**: Runtime type validation

---

**Target Users**: Writers, game masters, worldbuilders, anyone managing complex fictional universes with interconnected stories, characters, and events.

**License**: GPL-3.0-or-later

**Maintainer**: Tenebrie (tianara@tenebrie.com)
