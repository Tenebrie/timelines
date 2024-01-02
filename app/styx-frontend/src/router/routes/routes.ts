import { useBaseRouter } from '../useBaseRouter'
import { adminQueryParams, adminRoutes } from './adminRoutes'
import { appQueryParams, appRoutes } from './appRoutes'
import { homeQueryParams, homeRoutes } from './homeRoutes'
import { worldQueryParams, worldRoutes } from './worldRoutes'

export const allRoutes = {
	...adminRoutes,
	...appRoutes,
	...homeRoutes,
	...worldRoutes,
}

export const allQueries = {
	...adminQueryParams,
	...appQueryParams,
	...homeQueryParams,
	...worldQueryParams,
}

export const useRouter = () => useBaseRouter(allRoutes, allQueries)

// export type AllRouteParamMapping = AppRouteParamMapping & HomeRouteParamMapping & WorldRouteParamMapping
export type AllRouteParamMapping = Record<string, any>
