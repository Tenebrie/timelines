import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWorldRouterState } from '@/app/features/world/selectors'

import { useBaseRouter } from '../useBaseRouter'
import { QueryParams } from './QueryParams'

export const worldRoutes = {
	root: '/world/:worldId',
	outliner: '/world/:worldId/outliner',
	actorEditor: '/world/:worldId/actor/:actorId',
	eventCreator: '/world/:worldId/editor/create',
	eventEditor: '/world/:worldId/editor/:eventId',
	eventDeltaCreator: '/world/:worldId/editor/:eventId/delta/create',
	eventDeltaEditor: '/world/:worldId/editor/:eventId/delta/:deltaId',
} as const

export const worldQueryParams = {
	[worldRoutes.root]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldRoutes.outliner]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldRoutes.actorEditor]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldRoutes.eventCreator]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldRoutes.eventEditor]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldRoutes.eventDeltaCreator]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldRoutes.eventDeltaEditor]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
}

export const useWorldRouter = () => {
	const baseRouter = useBaseRouter(worldRoutes, worldQueryParams)
	const { id: worldId, isReadOnly } = useSelector(
		getWorldRouterState,
		(a, b) => a.id === b.id && a.isReadOnly === b.isReadOnly,
	)

	const navigateToCurrentWorldRoot = useCallback(() => {
		baseRouter.navigateTo({
			target: worldRoutes.root,
			args: {
				worldId,
			},
		})
	}, [baseRouter, worldId])

	const navigateToOutliner = useCallback(() => {
		baseRouter.navigateTo({
			target: worldRoutes.outliner,
			args: {
				worldId,
			},
		})
	}, [baseRouter, worldId])

	const navigateToEventCreator = useCallback(() => {
		if (isReadOnly) {
			return
		}
		baseRouter.navigateTo({
			target: worldRoutes.eventCreator,
			args: {
				worldId,
			},
		})
	}, [baseRouter, isReadOnly, worldId])

	const navigateToEventDeltaCreator = useCallback(
		({ eventId }: { eventId: string }) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.eventDeltaCreator,
				args: {
					worldId,
					eventId,
				},
			})
		},
		[baseRouter, isReadOnly, worldId],
	)

	const navigateToActorEditor = useCallback(
		(actorId: string) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.actorEditor,
				args: {
					worldId,
					actorId,
				},
			})
		},
		[baseRouter, isReadOnly, worldId],
	)

	const navigateToEventEditor = useCallback(
		({ eventId }: { eventId: string }) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.eventEditor,
				args: {
					worldId,
					eventId,
				},
			})
		},
		[baseRouter, isReadOnly, worldId],
	)

	const navigateToEventDeltaEditor = useCallback(
		({ eventId, deltaId }: { eventId: string; deltaId: string }) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.eventDeltaEditor,
				args: {
					worldId,
					eventId,
					deltaId,
				},
			})
		},
		[baseRouter, isReadOnly, worldId],
	)

	return {
		...baseRouter,
		navigateToCurrentWorldRoot,
		navigateToOutliner,
		navigateToEventCreator,
		navigateToEventDeltaCreator,
		navigateToActorEditor,
		navigateToEventEditor,
		navigateToEventDeltaEditor,
	}
}
