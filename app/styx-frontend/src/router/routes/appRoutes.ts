import { useBaseRouter } from '../useBaseRouter'

export const appRoutes = {
	limbo: '/',
	home: '/home',
	login: '/login',
	register: '/register',
} as const

export const appQueryParams = {
	[appRoutes.limbo]: undefined,
	[appRoutes.home]: undefined,
	[appRoutes.login]: undefined,
	[appRoutes.register]: undefined,
}

export const useAppRouter = () => useBaseRouter(appRoutes, appQueryParams)
