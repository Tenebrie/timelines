import { useBaseRouter } from '../../useBaseRouter'

export const homeRoutes = {
	root: '/home',
	worldDetails: '/home/world/:worldId',
} as const

export const homeQueryParams = {
	[homeRoutes.root]: undefined,
	[homeRoutes.worldDetails]: undefined,
}

export const useHomeRouter = () => useBaseRouter(homeRoutes, homeQueryParams)
