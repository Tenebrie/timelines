import { useBaseRouter } from '../../useBaseRouter'

export const worldWikiRoutes = {
	root: '/world/:worldId/wiki',
	article: '/world/:worldId/wiki/:articleId',
} as const

export const worldWikiQueryParams = {
	[worldWikiRoutes.root]: undefined,
	[worldWikiRoutes.article]: undefined,
}

export const useWorldWikiRouter = () => {
	const baseRouter = useBaseRouter(worldWikiRoutes, worldWikiQueryParams)

	return baseRouter
}
