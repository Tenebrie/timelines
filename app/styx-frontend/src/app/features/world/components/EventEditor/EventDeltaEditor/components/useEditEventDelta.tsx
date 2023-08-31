import { useCallback, useEffect, useRef } from 'react'

import {
	UpdateWorldEventDeltaApiArg,
	useUpdateWorldEventDeltaMutation,
} from '../../../../../../../api/rheaApi'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { useWorldRouter } from '../../../../router'
import { WorldEventDelta } from '../../../../types'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	mode: 'create' | 'edit'
	deltaState: WorldEventDelta
	state: ReturnType<typeof useEventDeltaFields>['state']
}

type SavedDeltaState = Pick<WorldEventDelta, 'name' | 'timestamp' | 'description' | 'customName'>

export const useEditEventDelta = ({ mode, deltaState, state }: Props) => {
	const { name, timestamp, description, customName, setName, setTimestamp, setDescription, setCustomName } =
		state

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<SavedDeltaState>(deltaState)
	const lastSavedAt = useRef<Date>(new Date(deltaState.updatedAt))

	useEffect(() => {
		if (new Date(deltaState.updatedAt) > lastSavedAt.current) {
			setName(deltaState.name ?? undefined)
			setTimestamp(deltaState.timestamp)
			setDescription(deltaState.description ?? undefined)
			setCustomName(deltaState.customName ?? undefined)
			savingEnabled.current = false
		}
	}, [deltaState, setCustomName, setDescription, setName, setTimestamp])

	// const { openDeleteEventModal } = worldSlice.actions
	// const dispatch = useDispatch()

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
					body,
				})
			)
			if (error) {
				return
			}
			lastSaved.current = {
				...response,
				timestamp: Number(response.timestamp),
			}
			lastSavedAt.current = new Date()
		},
		[deltaState, updateDeltaState, worldId]
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
				customName,
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
				lastSaved.current.description === description &&
				lastSaved.current.customName === customName)
		) {
			return
		}

		autosave()
	}, [autosave, customName, description, isFirstRender, mode, name, timestamp])

	const onDelete = useCallback(() => {
		// dispatch(openDeleteEventModal(event))
	}, [])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
