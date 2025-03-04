/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ToolsImport } from './routes/tools'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginImport } from './routes/login'
import { Route as HomeImport } from './routes/home'
import { Route as AdminImport } from './routes/admin'
import { Route as IndexImport } from './routes/index'
import { Route as SecretMusicImport } from './routes/secret/music'
import { Route as WorldWorldIdWorldImport } from './routes/world.$worldId/_world'
import { Route as WorldWorldIdWorldTimelineImport } from './routes/world.$worldId/_world.timeline'
import { Route as WorldWorldIdWorldSettingsImport } from './routes/world.$worldId/_world.settings'
import { Route as WorldWorldIdWorldMindmapImport } from './routes/world.$worldId/_world.mindmap'
import { Route as WorldWorldIdWorldWikiWikiImport } from './routes/world.$worldId/_world.wiki/_wiki'
import { Route as WorldWorldIdWorldWikiWikiIndexImport } from './routes/world.$worldId/_world.wiki/_wiki.index'
import { Route as WorldWorldIdWorldWikiWikiArticleIdImport } from './routes/world.$worldId/_world.wiki/_wiki.$articleId'

// Create Virtual Routes

const WorldWorldIdImport = createFileRoute('/world/$worldId')()
const WorldWorldIdWorldWikiImport = createFileRoute(
  '/world/$worldId/_world/wiki',
)()

// Create/Update Routes

const ToolsRoute = ToolsImport.update({
  id: '/tools',
  path: '/tools',
  getParentRoute: () => rootRoute,
} as any)

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const HomeRoute = HomeImport.update({
  id: '/home',
  path: '/home',
  getParentRoute: () => rootRoute,
} as any)

const AdminRoute = AdminImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const WorldWorldIdRoute = WorldWorldIdImport.update({
  id: '/world/$worldId',
  path: '/world/$worldId',
  getParentRoute: () => rootRoute,
} as any)

const SecretMusicRoute = SecretMusicImport.update({
  id: '/secret/music',
  path: '/secret/music',
  getParentRoute: () => rootRoute,
} as any)

const WorldWorldIdWorldRoute = WorldWorldIdWorldImport.update({
  id: '/_world',
  getParentRoute: () => WorldWorldIdRoute,
} as any)

const WorldWorldIdWorldWikiRoute = WorldWorldIdWorldWikiImport.update({
  id: '/wiki',
  path: '/wiki',
  getParentRoute: () => WorldWorldIdWorldRoute,
} as any)

const WorldWorldIdWorldTimelineRoute = WorldWorldIdWorldTimelineImport.update({
  id: '/timeline',
  path: '/timeline',
  getParentRoute: () => WorldWorldIdWorldRoute,
} as any)

const WorldWorldIdWorldSettingsRoute = WorldWorldIdWorldSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => WorldWorldIdWorldRoute,
} as any)

const WorldWorldIdWorldMindmapRoute = WorldWorldIdWorldMindmapImport.update({
  id: '/mindmap',
  path: '/mindmap',
  getParentRoute: () => WorldWorldIdWorldRoute,
} as any)

const WorldWorldIdWorldWikiWikiRoute = WorldWorldIdWorldWikiWikiImport.update({
  id: '/_wiki',
  getParentRoute: () => WorldWorldIdWorldWikiRoute,
} as any)

const WorldWorldIdWorldWikiWikiIndexRoute =
  WorldWorldIdWorldWikiWikiIndexImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => WorldWorldIdWorldWikiWikiRoute,
  } as any)

const WorldWorldIdWorldWikiWikiArticleIdRoute =
  WorldWorldIdWorldWikiWikiArticleIdImport.update({
    id: '/$articleId',
    path: '/$articleId',
    getParentRoute: () => WorldWorldIdWorldWikiWikiRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/home': {
      id: '/home'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/tools': {
      id: '/tools'
      path: '/tools'
      fullPath: '/tools'
      preLoaderRoute: typeof ToolsImport
      parentRoute: typeof rootRoute
    }
    '/secret/music': {
      id: '/secret/music'
      path: '/secret/music'
      fullPath: '/secret/music'
      preLoaderRoute: typeof SecretMusicImport
      parentRoute: typeof rootRoute
    }
    '/world/$worldId': {
      id: '/world/$worldId'
      path: '/world/$worldId'
      fullPath: '/world/$worldId'
      preLoaderRoute: typeof WorldWorldIdImport
      parentRoute: typeof rootRoute
    }
    '/world/$worldId/_world': {
      id: '/world/$worldId/_world'
      path: '/world/$worldId'
      fullPath: '/world/$worldId'
      preLoaderRoute: typeof WorldWorldIdWorldImport
      parentRoute: typeof WorldWorldIdRoute
    }
    '/world/$worldId/_world/mindmap': {
      id: '/world/$worldId/_world/mindmap'
      path: '/mindmap'
      fullPath: '/world/$worldId/mindmap'
      preLoaderRoute: typeof WorldWorldIdWorldMindmapImport
      parentRoute: typeof WorldWorldIdWorldImport
    }
    '/world/$worldId/_world/settings': {
      id: '/world/$worldId/_world/settings'
      path: '/settings'
      fullPath: '/world/$worldId/settings'
      preLoaderRoute: typeof WorldWorldIdWorldSettingsImport
      parentRoute: typeof WorldWorldIdWorldImport
    }
    '/world/$worldId/_world/timeline': {
      id: '/world/$worldId/_world/timeline'
      path: '/timeline'
      fullPath: '/world/$worldId/timeline'
      preLoaderRoute: typeof WorldWorldIdWorldTimelineImport
      parentRoute: typeof WorldWorldIdWorldImport
    }
    '/world/$worldId/_world/wiki': {
      id: '/world/$worldId/_world/wiki'
      path: '/wiki'
      fullPath: '/world/$worldId/wiki'
      preLoaderRoute: typeof WorldWorldIdWorldWikiImport
      parentRoute: typeof WorldWorldIdWorldImport
    }
    '/world/$worldId/_world/wiki/_wiki': {
      id: '/world/$worldId/_world/wiki/_wiki'
      path: '/wiki'
      fullPath: '/world/$worldId/wiki'
      preLoaderRoute: typeof WorldWorldIdWorldWikiWikiImport
      parentRoute: typeof WorldWorldIdWorldWikiRoute
    }
    '/world/$worldId/_world/wiki/_wiki/$articleId': {
      id: '/world/$worldId/_world/wiki/_wiki/$articleId'
      path: '/$articleId'
      fullPath: '/world/$worldId/wiki/$articleId'
      preLoaderRoute: typeof WorldWorldIdWorldWikiWikiArticleIdImport
      parentRoute: typeof WorldWorldIdWorldWikiWikiImport
    }
    '/world/$worldId/_world/wiki/_wiki/': {
      id: '/world/$worldId/_world/wiki/_wiki/'
      path: '/'
      fullPath: '/world/$worldId/wiki/'
      preLoaderRoute: typeof WorldWorldIdWorldWikiWikiIndexImport
      parentRoute: typeof WorldWorldIdWorldWikiWikiImport
    }
  }
}

// Create and export the route tree

interface WorldWorldIdWorldWikiWikiRouteChildren {
  WorldWorldIdWorldWikiWikiArticleIdRoute: typeof WorldWorldIdWorldWikiWikiArticleIdRoute
  WorldWorldIdWorldWikiWikiIndexRoute: typeof WorldWorldIdWorldWikiWikiIndexRoute
}

const WorldWorldIdWorldWikiWikiRouteChildren: WorldWorldIdWorldWikiWikiRouteChildren =
  {
    WorldWorldIdWorldWikiWikiArticleIdRoute:
      WorldWorldIdWorldWikiWikiArticleIdRoute,
    WorldWorldIdWorldWikiWikiIndexRoute: WorldWorldIdWorldWikiWikiIndexRoute,
  }

const WorldWorldIdWorldWikiWikiRouteWithChildren =
  WorldWorldIdWorldWikiWikiRoute._addFileChildren(
    WorldWorldIdWorldWikiWikiRouteChildren,
  )

interface WorldWorldIdWorldWikiRouteChildren {
  WorldWorldIdWorldWikiWikiRoute: typeof WorldWorldIdWorldWikiWikiRouteWithChildren
}

const WorldWorldIdWorldWikiRouteChildren: WorldWorldIdWorldWikiRouteChildren = {
  WorldWorldIdWorldWikiWikiRoute: WorldWorldIdWorldWikiWikiRouteWithChildren,
}

const WorldWorldIdWorldWikiRouteWithChildren =
  WorldWorldIdWorldWikiRoute._addFileChildren(
    WorldWorldIdWorldWikiRouteChildren,
  )

interface WorldWorldIdWorldRouteChildren {
  WorldWorldIdWorldMindmapRoute: typeof WorldWorldIdWorldMindmapRoute
  WorldWorldIdWorldSettingsRoute: typeof WorldWorldIdWorldSettingsRoute
  WorldWorldIdWorldTimelineRoute: typeof WorldWorldIdWorldTimelineRoute
  WorldWorldIdWorldWikiRoute: typeof WorldWorldIdWorldWikiRouteWithChildren
}

const WorldWorldIdWorldRouteChildren: WorldWorldIdWorldRouteChildren = {
  WorldWorldIdWorldMindmapRoute: WorldWorldIdWorldMindmapRoute,
  WorldWorldIdWorldSettingsRoute: WorldWorldIdWorldSettingsRoute,
  WorldWorldIdWorldTimelineRoute: WorldWorldIdWorldTimelineRoute,
  WorldWorldIdWorldWikiRoute: WorldWorldIdWorldWikiRouteWithChildren,
}

const WorldWorldIdWorldRouteWithChildren =
  WorldWorldIdWorldRoute._addFileChildren(WorldWorldIdWorldRouteChildren)

interface WorldWorldIdRouteChildren {
  WorldWorldIdWorldRoute: typeof WorldWorldIdWorldRouteWithChildren
}

const WorldWorldIdRouteChildren: WorldWorldIdRouteChildren = {
  WorldWorldIdWorldRoute: WorldWorldIdWorldRouteWithChildren,
}

const WorldWorldIdRouteWithChildren = WorldWorldIdRoute._addFileChildren(
  WorldWorldIdRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/home': typeof HomeRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/tools': typeof ToolsRoute
  '/secret/music': typeof SecretMusicRoute
  '/world/$worldId': typeof WorldWorldIdWorldRouteWithChildren
  '/world/$worldId/mindmap': typeof WorldWorldIdWorldMindmapRoute
  '/world/$worldId/settings': typeof WorldWorldIdWorldSettingsRoute
  '/world/$worldId/timeline': typeof WorldWorldIdWorldTimelineRoute
  '/world/$worldId/wiki': typeof WorldWorldIdWorldWikiWikiRouteWithChildren
  '/world/$worldId/wiki/$articleId': typeof WorldWorldIdWorldWikiWikiArticleIdRoute
  '/world/$worldId/wiki/': typeof WorldWorldIdWorldWikiWikiIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/home': typeof HomeRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/tools': typeof ToolsRoute
  '/secret/music': typeof SecretMusicRoute
  '/world/$worldId': typeof WorldWorldIdWorldRouteWithChildren
  '/world/$worldId/mindmap': typeof WorldWorldIdWorldMindmapRoute
  '/world/$worldId/settings': typeof WorldWorldIdWorldSettingsRoute
  '/world/$worldId/timeline': typeof WorldWorldIdWorldTimelineRoute
  '/world/$worldId/wiki': typeof WorldWorldIdWorldWikiWikiIndexRoute
  '/world/$worldId/wiki/$articleId': typeof WorldWorldIdWorldWikiWikiArticleIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/home': typeof HomeRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/tools': typeof ToolsRoute
  '/secret/music': typeof SecretMusicRoute
  '/world/$worldId': typeof WorldWorldIdRouteWithChildren
  '/world/$worldId/_world': typeof WorldWorldIdWorldRouteWithChildren
  '/world/$worldId/_world/mindmap': typeof WorldWorldIdWorldMindmapRoute
  '/world/$worldId/_world/settings': typeof WorldWorldIdWorldSettingsRoute
  '/world/$worldId/_world/timeline': typeof WorldWorldIdWorldTimelineRoute
  '/world/$worldId/_world/wiki': typeof WorldWorldIdWorldWikiRouteWithChildren
  '/world/$worldId/_world/wiki/_wiki': typeof WorldWorldIdWorldWikiWikiRouteWithChildren
  '/world/$worldId/_world/wiki/_wiki/$articleId': typeof WorldWorldIdWorldWikiWikiArticleIdRoute
  '/world/$worldId/_world/wiki/_wiki/': typeof WorldWorldIdWorldWikiWikiIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/home'
    | '/login'
    | '/register'
    | '/tools'
    | '/secret/music'
    | '/world/$worldId'
    | '/world/$worldId/mindmap'
    | '/world/$worldId/settings'
    | '/world/$worldId/timeline'
    | '/world/$worldId/wiki'
    | '/world/$worldId/wiki/$articleId'
    | '/world/$worldId/wiki/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/home'
    | '/login'
    | '/register'
    | '/tools'
    | '/secret/music'
    | '/world/$worldId'
    | '/world/$worldId/mindmap'
    | '/world/$worldId/settings'
    | '/world/$worldId/timeline'
    | '/world/$worldId/wiki'
    | '/world/$worldId/wiki/$articleId'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/home'
    | '/login'
    | '/register'
    | '/tools'
    | '/secret/music'
    | '/world/$worldId'
    | '/world/$worldId/_world'
    | '/world/$worldId/_world/mindmap'
    | '/world/$worldId/_world/settings'
    | '/world/$worldId/_world/timeline'
    | '/world/$worldId/_world/wiki'
    | '/world/$worldId/_world/wiki/_wiki'
    | '/world/$worldId/_world/wiki/_wiki/$articleId'
    | '/world/$worldId/_world/wiki/_wiki/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  HomeRoute: typeof HomeRoute
  LoginRoute: typeof LoginRoute
  RegisterRoute: typeof RegisterRoute
  ToolsRoute: typeof ToolsRoute
  SecretMusicRoute: typeof SecretMusicRoute
  WorldWorldIdRoute: typeof WorldWorldIdRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  HomeRoute: HomeRoute,
  LoginRoute: LoginRoute,
  RegisterRoute: RegisterRoute,
  ToolsRoute: ToolsRoute,
  SecretMusicRoute: SecretMusicRoute,
  WorldWorldIdRoute: WorldWorldIdRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin",
        "/home",
        "/login",
        "/register",
        "/tools",
        "/secret/music",
        "/world/$worldId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx"
    },
    "/home": {
      "filePath": "home.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/tools": {
      "filePath": "tools.tsx"
    },
    "/secret/music": {
      "filePath": "secret/music.tsx"
    },
    "/world/$worldId": {
      "filePath": "world.$worldId",
      "children": [
        "/world/$worldId/_world"
      ]
    },
    "/world/$worldId/_world": {
      "filePath": "world.$worldId/_world.tsx",
      "parent": "/world/$worldId",
      "children": [
        "/world/$worldId/_world/mindmap",
        "/world/$worldId/_world/settings",
        "/world/$worldId/_world/timeline",
        "/world/$worldId/_world/wiki"
      ]
    },
    "/world/$worldId/_world/mindmap": {
      "filePath": "world.$worldId/_world.mindmap.tsx",
      "parent": "/world/$worldId/_world"
    },
    "/world/$worldId/_world/settings": {
      "filePath": "world.$worldId/_world.settings.tsx",
      "parent": "/world/$worldId/_world"
    },
    "/world/$worldId/_world/timeline": {
      "filePath": "world.$worldId/_world.timeline.tsx",
      "parent": "/world/$worldId/_world"
    },
    "/world/$worldId/_world/wiki": {
      "filePath": "world.$worldId/_world.wiki",
      "parent": "/world/$worldId/_world",
      "children": [
        "/world/$worldId/_world/wiki/_wiki"
      ]
    },
    "/world/$worldId/_world/wiki/_wiki": {
      "filePath": "world.$worldId/_world.wiki/_wiki.tsx",
      "parent": "/world/$worldId/_world/wiki",
      "children": [
        "/world/$worldId/_world/wiki/_wiki/$articleId",
        "/world/$worldId/_world/wiki/_wiki/"
      ]
    },
    "/world/$worldId/_world/wiki/_wiki/$articleId": {
      "filePath": "world.$worldId/_world.wiki/_wiki.$articleId.tsx",
      "parent": "/world/$worldId/_world/wiki/_wiki"
    },
    "/world/$worldId/_world/wiki/_wiki/": {
      "filePath": "world.$worldId/_world.wiki/_wiki.index.tsx",
      "parent": "/world/$worldId/_world/wiki/_wiki"
    }
  }
}
ROUTE_MANIFEST_END */
