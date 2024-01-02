import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import {
	UpdateWorldEventDeltaApiArg,
	useUpdateWorldEventDeltaMutation,
} from '../../../../../../../api/rheaApi'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { ErrorState } from '../../../../../../utils/useErrorState'
import { worldSlice } from '../../../../reducer'
import { WorldEventDelta } from '../../../../types'
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

	const { openDeleteEventDeltaModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateDeltaState, { isLoading: isSaving, isError }] = useUpdateWorldEventDeltaMutation()

	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.eventEditor)

	const sendUpdate = useCallback(
		async (body: UpdateWorldEventDeltaApiArg['body']) => {
			setDirty(false)
			const { error } = parseApiResponse(
				await updateDeltaState({
					worldId,
					eventId: deltaState.worldEventId,
					deltaId: deltaState.id,
					body: {
						timestamp: body.timestamp,
						name: body.description && body.name ? body.name : null,
						description: body.description,
					},
				})
			)
			if (error) {
				errorState.raiseError('DELTA_EDITING_FAILED', error.message)
				return
			}
			lastSavedAt.current = new Date()
			errorState.clearError()
		},
		[deltaState.id, deltaState.worldEventId, errorState, setDirty, updateDeltaState, worldId]
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
		dispatch(openDeleteEventDeltaModal(deltaState))
	}, [deltaState, dispatch, openDeleteEventDeltaModal])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
