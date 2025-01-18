import { useBaseRouter } from '../../useBaseRouter'

export const worldRoutes = {
	root: '/world/:worldId',
	timeline: '/world/:worldId/timeline',
	overview: '/world/:worldId/overview',
	wiki: '/world/:worldId/wiki',
	actors: '/world/:worldId/actors',
	settings: '/world/:worldId/settings',
} as const

export const worldTimelineQueryParams = {
	[worldRoutes.root]: undefined,
	[worldRoutes.timeline]: undefined,
	[worldRoutes.overview]: undefined,
	[worldRoutes.wiki]: undefined,
	[worldRoutes.actors]: undefined,
	[worldRoutes.settings]: undefined,
}

export const useWorldRouter = () => {
	const baseRouter = useBaseRouter(worldRoutes, worldTimelineQueryParams)

	return baseRouter
}
