import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import {
	UpdateWorldEventDeltaApiArg,
	useUpdateWorldEventDeltaMutation,
} from '../../../../../../../api/rheaApi'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { ErrorState } from '../../../../../../utils/useErrorState'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { WorldEventDelta } from '../../../../types'
import { EventDeltaDetailsEditorErrors } from './EventDeltaDetailsEditor'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	mode: 'create' | 'edit'
	deltaState: WorldEventDelta
	errorState: ErrorState<EventDeltaDetailsEditorErrors>
	state: ReturnType<typeof useEventDeltaFields>['state']
}

type SavedDeltaState = Pick<WorldEventDelta, 'name' | 'timestamp' | 'description' | 'customName'>

export const useEditEventDelta = ({ mode, deltaState, errorState, state }: Props) => {
	const { name, timestamp, description, setName, setTimestamp, setDescription } = state

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<SavedDeltaState>(deltaState)
	const lastSavedAt = useRef<Date>(new Date(deltaState.updatedAt))

	useEffect(() => {
		if (new Date(deltaState.updatedAt) > lastSavedAt.current) {
			setName(deltaState.name ?? null)
			setTimestamp(deltaState.timestamp)
			setDescription(deltaState.description ?? null)
			savingEnabled.current = false
		}
	}, [deltaState, setDescription, setName, setTimestamp])

	const { openDeleteEventDeltaModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateDeltaState, { isLoading: isSaving, isError }] = useUpdateWorldEventDeltaMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (body: UpdateWorldEventDeltaApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateDeltaState({
					worldId,
					eventId: deltaState.worldEventId,
					deltaId: deltaState.id,
					body: {
						timestamp: body.timestamp,
						name: body.name ? body.name : null,
						description: body.description ? body.description : null,
						customName: false,
					},
				})
			)
			if (error) {
				errorState.raiseError('DELTA_EDITING_FAILED', error.message)
				return
			}
			lastSaved.current = {
				...response,
				timestamp: Number(response.timestamp),
			}
			lastSavedAt.current = new Date()
			errorState.clearError()
		},
		[deltaState.id, deltaState.worldEventId, errorState, updateDeltaState, worldId]
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				name,
				timestamp: String(timestamp),
				description,
			}),
		isSaving,
		isError,
	})

	const { isFirstRender } = useIsFirstRender()
	useEffect(() => {
		if (!savingEnabled.current || mode !== 'edit') {
			savingEnabled.current = true
			return
		}
		if (
			isFirstRender ||
			(lastSaved.current.name === name &&
				lastSaved.current.timestamp === timestamp &&
				lastSaved.current.description === description)
		) {
			return
		}

		autosave()
	}, [autosave, deltaState, description, isFirstRender, mode, name, timestamp])

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
