import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTimelineBusDispatch } from '@/app/features/world/hooks/useTimelineBus'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldRouterState } from '@/app/features/world/selectors'

import { QueryStrategy, useBaseRouter } from '../useBaseRouter'
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

	const scrollTimelineTo = useTimelineBusDispatch()
	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

	const navigateToCurrentWorldRoot = useCallback(() => {
		baseRouter.navigateTo({
			target: worldRoutes.root,
			args: {
				worldId,
			},
			query: {
				[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
			},
		})
	}, [baseRouter, worldId])

	const navigateToOutliner = useCallback(() => {
		baseRouter.navigateTo({
			target: worldRoutes.outliner,
			args: {
				worldId,
			},
			query: {
				[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
			},
		})
	}, [baseRouter, worldId])

	const navigateToEventCreator = useCallback(
		(selectedTime?: number) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.eventCreator,
				args: {
					worldId,
				},
				query: {
					[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
				},
			})
			if (selectedTime !== undefined) {
				scrollTimelineTo(selectedTime)
				dispatch(setSelectedTime(selectedTime))
			}
		},
		[baseRouter, dispatch, isReadOnly, scrollTimelineTo, setSelectedTime, worldId],
	)

	const navigateToEventDeltaCreator = useCallback(
		({ eventId, selectedTime }: { eventId: string; selectedTime?: number }) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.eventDeltaCreator,
				args: {
					worldId,
					eventId,
				},
				query: {
					[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
				},
			})
			if (selectedTime !== undefined) {
				scrollTimelineTo(selectedTime)
				dispatch(setSelectedTime(selectedTime))
			}
		},
		[baseRouter, dispatch, isReadOnly, scrollTimelineTo, setSelectedTime, worldId],
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
				query: {
					[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
				},
			})
		},
		[baseRouter, isReadOnly, worldId],
	)

	const navigateToEventEditor = useCallback(
		({ eventId, selectedTime }: { eventId: string; selectedTime?: number }) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldRoutes.eventEditor,
				args: {
					worldId,
					eventId,
				},
				query: {
					[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
				},
			})
			if (selectedTime !== undefined) {
				scrollTimelineTo(selectedTime)
				dispatch(setSelectedTime(selectedTime))
			}
		},
		[baseRouter, dispatch, isReadOnly, scrollTimelineTo, setSelectedTime, worldId],
	)

	const navigateToEventDeltaEditor = useCallback(
		({ eventId, deltaId, selectedTime }: { eventId: string; deltaId: string; selectedTime?: number }) => {
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
				query: {
					[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
				},
			})
			if (selectedTime !== undefined) {
				scrollTimelineTo(selectedTime)
				dispatch(setSelectedTime(selectedTime))
			}
		},
		[baseRouter, dispatch, isReadOnly, scrollTimelineTo, setSelectedTime, worldId],
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
