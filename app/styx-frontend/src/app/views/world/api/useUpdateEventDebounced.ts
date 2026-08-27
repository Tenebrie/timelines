import debounce from 'lodash.debounce'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldDetailsApi } from '@/api/worldDetailsApi'
import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { useAutoRef } from '@/app/hooks/useAutoRef'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { getWorldIdState, getWorldState } from '@/app/views/world/WorldSliceSelectors'

export function useUpdateEventDebounced() {
	const worldId = useSelector(getWorldIdState)
	const events = useSelector(getWorldState, (a, b) => a.events === b.events).events
	const [updateWorldEvent, state] = useUpdateWorldEventMutation()

	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const eventsRef = useAutoRef(events)

	const performDebounced = useMemo(
		() =>
			debounce(async (id: string, body: UpdateWorldEventApiArg['body']) => {
				const { error } = parseApiResponse(
					await updateWorldEvent({
						worldId,
						eventId: id,
						body,
					}),
				)
				if (error) {
					return
				}

				// Invalidate common icons query cache if icon has changed
				const oldIcon = eventsRef.current.find((e) => e.id === id)?.icon
				if (body.icon !== undefined && body.icon !== oldIcon) {
					dispatch(worldDetailsApi.util.invalidateTags([{ type: 'worldCommonIcons' }]))
				}
			}, 500),
		[dispatch, eventsRef, updateWorldEvent, worldId],
	)

	const perform = useCallback(
		async (
			id: string,
			body: Omit<UpdateWorldEventApiArg['body'], 'timestamp' | 'revokedAt'> & {
				timestamp?: number
				revokedAt?: number
			},
		) => {
			dispatch(
				updateEvent({
					id,
					...body,
				}),
			)
			performDebounced(id, {
				...body,
				timestamp: body.timestamp !== undefined ? String(body.timestamp) : undefined,
				revokedAt: body.revokedAt !== undefined ? String(body.revokedAt) : undefined,
			})
		},
		[dispatch, updateEvent, performDebounced],
	)

	return [perform, state] as const
}
