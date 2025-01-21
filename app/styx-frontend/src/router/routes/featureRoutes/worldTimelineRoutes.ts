import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '@/app/features/world/reducer'
import { getWorldRouterState } from '@/app/features/world/selectors'
import { useTimelineBusDispatch } from '@/app/features/worldTimeline/hooks/useTimelineBus'

import { GenericArgsOrVoid, GenericQueryOrVoid, QueryStrategy } from '../../types'
import { useBaseRouter } from '../../useBaseRouter'
import { QueryParams } from '../QueryParams'

export const worldTimelineRoutes = {
	root: '/world/:worldId/timeline',
	outliner: '/world/:worldId/timeline/outliner',
	actorEditor: '/world/:worldId/timeline/actor/:actorId',
	eventCreator: '/world/:worldId/timeline/editor/create',
	eventEditor: '/world/:worldId/timeline/editor/:eventId',
	eventDeltaCreator: '/world/:worldId/timeline/editor/:eventId/delta/create',
	eventDeltaEditor: '/world/:worldId/timeline/editor/:eventId/delta/:deltaId',
} as const

export const worldTimelineQueryParams = {
	[worldTimelineRoutes.root]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldTimelineRoutes.outliner]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldTimelineRoutes.actorEditor]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldTimelineRoutes.eventCreator]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldTimelineRoutes.eventEditor]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldTimelineRoutes.eventDeltaCreator]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
	[worldTimelineRoutes.eventDeltaEditor]: {
		[QueryParams.SELECTED_TIME]: '0' as string,
	},
}

export type ArgsOrVoid = GenericArgsOrVoid<typeof worldTimelineRoutes>
export type QueryOrVoid = GenericQueryOrVoid<typeof worldTimelineQueryParams>

export const useWorldTimelineRouter = () => {
	const baseRouter = useBaseRouter(worldTimelineRoutes, worldTimelineQueryParams)
	const { id: worldId, isReadOnly } = useSelector(
		getWorldRouterState,
		(a, b) => a.id === b.id && a.isReadOnly === b.isReadOnly,
	)

	const scrollTimelineTo = useTimelineBusDispatch()
	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

	const navigateToCurrentWorldRoot = useCallback(() => {
		baseRouter.navigateTo({
			target: worldTimelineRoutes.root,
			args: {
				worldId,
			},
			query: {
				[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
			},
		})
	}, [baseRouter, worldId])

	const navigateToOutliner = useCallback(
		(selectedTime?: number, updateQuery?: boolean) => {
			baseRouter.navigateTo({
				target: worldTimelineRoutes.outliner,
				args: {
					worldId,
				},
				query: {
					[QueryParams.SELECTED_TIME]: updateQuery ? selectedTime : QueryStrategy.Preserve,
				},
			})
			if (selectedTime !== undefined) {
				scrollTimelineTo(selectedTime)
				dispatch(setSelectedTime(selectedTime))
			}
		},
		[baseRouter, dispatch, scrollTimelineTo, setSelectedTime, worldId],
	)

	const navigateToEventCreator = useCallback(
		(selectedTime?: number) => {
			if (isReadOnly) {
				return
			}
			baseRouter.navigateTo({
				target: worldTimelineRoutes.eventCreator,
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
				target: worldTimelineRoutes.eventDeltaCreator,
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
				target: worldTimelineRoutes.actorEditor,
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
				target: worldTimelineRoutes.eventEditor,
				args: {
					worldId,
					eventId,
				},
				query: {
					[QueryParams.SELECTED_TIME]: QueryStrategy.Preserve,
				},
			})
			if (selectedTime !== undefined) {
				setTimeout(() => {
					scrollTimelineTo(selectedTime)
					dispatch(setSelectedTime(selectedTime))
				})
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
				target: worldTimelineRoutes.eventDeltaEditor,
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
