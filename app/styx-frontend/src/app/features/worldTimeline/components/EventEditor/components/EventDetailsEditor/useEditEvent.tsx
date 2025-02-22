import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { useModal } from '@/app/features/modals/reducer'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { WorldEvent } from '@/app/features/worldTimeline/types'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { ingestEvent } from '@/app/utils/ingestEvent'
import { isNotNull } from '@/app/utils/isNotNull'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { useEventFields } from './useEventFields'

type Props = {
	mode: 'create' | 'create-compact' | 'edit'
	event: WorldEvent
	state: ReturnType<typeof useEventFields>['state']
}

export const useEditEvent = ({ mode, event, state }: Props) => {
	const { updateEvent } = worldSlice.actions
	const dispatch = useDispatch()

	const {
		isDirty,
		modules,
		name,
		icon,
		timestamp,
		revokedAt,
		mentions,
		description,
		descriptionRich,
		customNameEnabled,
		externalLink,
		setDirty,
		loadEvent,
	} = state

	const { open: openDeleteEventModal } = useModal('deleteEventModal')
	const [updateWorldEvent, { isLoading: isSaving, isError }] = useUpdateWorldEventMutation()

	const worldId = useSelector(getWorldIdState)

	const sendUpdate = useCallback(
		async (delta: UpdateWorldEventApiArg['body']) => {
			setDirty(false)
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					worldId: worldId,
					eventId: event.id,
					body: delta,
				}),
			)
			if (error) {
				return
			}
			const responseEvent = ingestEvent(response)
			loadEvent(responseEvent)
			dispatch(updateEvent(responseEvent))
		},
		[dispatch, event.id, loadEvent, setDirty, updateEvent, updateWorldEvent, worldId],
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				modules,
				name,
				icon,
				timestamp: String(timestamp),
				revokedAt: isNotNull(revokedAt) ? String(revokedAt) : null,
				description,
				descriptionRich,
				customNameEnabled,
				mentions,
				externalLink,
			}),
		isSaving,
		isError,
	})

	useEffect(() => {
		if (mode === 'edit' && isDirty) {
			autosave()
		}
	}, [autosave, isDirty, mode, state])

	const onDelete = useCallback(() => {
		openDeleteEventModal({ target: event })
	}, [event, openDeleteEventModal])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
