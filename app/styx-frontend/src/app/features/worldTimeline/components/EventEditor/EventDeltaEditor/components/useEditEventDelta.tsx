import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { UpdateWorldEventDeltaApiArg, useUpdateWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { useModal } from '@/app/features/modals/reducer'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { WorldEventDelta } from '@/app/features/worldTimeline/types'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { ingestEventDelta } from '@/app/utils/ingestEvent'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { ErrorState } from '@/app/utils/useErrorState'

import { EventDeltaDetailsEditorErrors } from './EventDeltaDetailsEditor'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	mode: 'create' | 'edit'
	deltaState: WorldEventDelta
	errorState: ErrorState<EventDeltaDetailsEditorErrors>
	state: ReturnType<typeof useEventDeltaFields>['state']
}

export const useEditEventDelta = ({ mode, deltaState, errorState, state }: Props) => {
	const { isDirty, name, timestamp, description, setDirty, setName, setTimestamp, setDescription } = state

	const { updateEventDelta } = worldSlice.actions
	const dispatch = useDispatch()

	const lastSavedAt = useRef<Date>(new Date(deltaState.updatedAt))

	useEffect(() => {
		if (new Date(deltaState.updatedAt) > lastSavedAt.current) {
			setName(deltaState.name ?? null, { cleanSet: true })
			setTimestamp(deltaState.timestamp, { cleanSet: true })
			setDescription(deltaState.description ?? null, { cleanSet: true })

			setDirty(false)
			lastSavedAt.current = new Date(deltaState.updatedAt)
		}
	}, [deltaState, setDescription, setDirty, setName, setTimestamp])

	const { open: openDeleteEventDeltaModal } = useModal('deleteEventDeltaModal')

	const [updateDeltaState, { isLoading: isSaving, isError }] = useUpdateWorldEventDeltaMutation()

	const worldId = useSelector(getWorldIdState)

	const sendUpdate = useCallback(
		async (body: UpdateWorldEventDeltaApiArg['body']) => {
			setDirty(false)
			const { response, error } = parseApiResponse(
				await updateDeltaState({
					worldId,
					eventId: deltaState.worldEventId,
					deltaId: deltaState.id,
					body: {
						timestamp: body.timestamp,
						name: body.description && body.name ? body.name : null,
						description: body.description,
					},
				}),
			)
			if (error) {
				errorState.raiseError('DELTA_EDITING_FAILED', error.message)
				return
			}
			lastSavedAt.current = new Date()
			dispatch(updateEventDelta(ingestEventDelta(response)))
			errorState.clearError()
		},
		[deltaState, dispatch, errorState, setDirty, updateDeltaState, updateEventDelta, worldId],
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () => {
			sendUpdate({
				name,
				timestamp: String(timestamp),
				description: description,
			})
		},
		isSaving,
		isError,
	})

	useEffect(() => {
		if (mode === 'edit' && isDirty.current) {
			autosave()
		}
	}, [autosave, isDirty, mode, state])

	const onDelete = useCallback(() => {
		openDeleteEventDeltaModal({ target: deltaState })
	}, [deltaState, openDeleteEventDeltaModal])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
