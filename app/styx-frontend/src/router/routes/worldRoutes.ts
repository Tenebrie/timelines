import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '../../app/features/world/selectors'
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
	[worldRoutes.root]: undefined,
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
	const { id: worldId } = useSelector(getWorldState)

	const navigateToCurrentWorldRoot = useCallback(() => {
		baseRouter.navigateTo({
			target: worldRoutes.root,
			args: {
				worldId,
			},
		})
	}, [baseRouter, worldId])

	const navigateToOutliner = useCallback(
		(time: number) => {
			baseRouter.navigateTo({
				target: worldRoutes.outliner,
				args: {
					worldId,
				},
				query: {
					time: String(time),
				},
			})
		},
		[baseRouter, worldId]
	)

	const navigateToEventCreator = useCallback(() => {
		baseRouter.navigateTo({
			target: worldRoutes.eventCreator,
			args: {
				worldId,
			},
		})
	}, [baseRouter, worldId])

	const navigateToEventDeltaCreator = useCallback(
		({ eventId, selectedTime }: { eventId: string; selectedTime: number }) => {
			baseRouter.navigateTo({
				target: worldRoutes.eventDeltaCreator,
				args: {
					worldId,
					eventId,
				},
				query: {
					[QueryParams.SELECTED_TIME]: String(selectedTime),
				},
			})
		},
		[baseRouter, worldId]
	)

	const navigateToActorEditor = useCallback(
		(actorId: string) => {
			baseRouter.navigateTo({
				target: worldRoutes.actorEditor,
				args: {
					worldId,
					actorId,
				},
			})
		},
		[baseRouter, worldId]
	)

	const navigateToEventEditor = useCallback(
		(eventId: string) => {
			baseRouter.navigateTo({
				target: worldRoutes.eventEditor,
				args: {
					worldId,
					eventId,
				},
			})
		},
		[baseRouter, worldId]
	)

	const navigateToEventDeltaEditor = useCallback(
		({ eventId, deltaId }: { eventId: string; deltaId: string }) => {
			baseRouter.navigateTo({
				target: worldRoutes.eventDeltaEditor,
				args: {
					worldId,
					eventId,
					deltaId,
				},
			})
		},
		[baseRouter, worldId]
	)

	const selectedTimeOrNull = useMemo(() => {
		const value = baseRouter.queryOfOrNull(worldRoutes.outliner).time
		return value === null ? null : Number(value)
	}, [baseRouter])

	const selectedTimeOrZero = useMemo(() => {
		return Number(baseRouter.queryOf(worldRoutes.outliner).time)
	}, [baseRouter])

	const selectTime = useCallback(
		(value: number | null) => {
			baseRouter.setQuery(QueryParams.SELECTED_TIME, String(value))
		},
		[baseRouter]
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
		selectedTimeOrNull,
		selectedTimeOrZero,
		selectTime,
	}
}
