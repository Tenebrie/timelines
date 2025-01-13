import { useBaseRouter } from '../useBaseRouter'
import { adminQueryParams, adminRoutes } from './adminRoutes'
import { appQueryParams, appRoutes } from './appRoutes'
import { homeQueryParams, homeRoutes } from './homeRoutes'
import { worldTimelineQueryParams, worldTimelineRoutes } from './worldTimelineRoutes'

export const routes = {
	...adminRoutes,
	...appRoutes,
	...homeRoutes,
	...worldTimelineRoutes,
}

export const allQueries = {
	...adminQueryParams,
	...appQueryParams,
	...homeQueryParams,
	...worldTimelineQueryParams,
}

export const useRouter = () => useBaseRouter(routes, allQueries)

// export type AllRouteParamMapping = AppRouteParamMapping & HomeRouteParamMapping & WorldRouteParamMapping
export type AllRouteParamMapping = Record<string, object | undefined>
