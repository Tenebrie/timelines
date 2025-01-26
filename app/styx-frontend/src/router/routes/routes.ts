import { useBaseRouter } from '../useBaseRouter'
import { appQueryParams, appRoutes } from './appRoutes'
import { adminQueryParams, adminRoutes } from './featureRoutes/adminRoutes'
import { homeQueryParams, homeRoutes } from './featureRoutes/homeRoutes'
import { worldTimelineQueryParams, worldTimelineRoutes } from './featureRoutes/worldTimelineRoutes'
import { worldWikiQueryParams, worldWikiRoutes } from './featureRoutes/worldWikiRoutes'

export const routes = {
	...adminRoutes,
	...homeRoutes,
	...appRoutes,
	...worldTimelineRoutes,
	...worldWikiRoutes,
}

export const allQueries = {
	...adminQueryParams,
	...homeQueryParams,
	...appQueryParams,
	...worldTimelineQueryParams,
	...worldWikiQueryParams,
}

export const useRouter = () => useBaseRouter(routes, allQueries)

// export type AllRouteParamMapping = AppRouteParamMapping & HomeRouteParamMapping & WorldRouteParamMapping
export type AllRouteParamMapping = Record<string, object | undefined>
