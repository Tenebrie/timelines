import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { getWorldIdState } from '@/app/features/world/selectors'
import { useTimelineBusDispatch } from '@/app/features/worldTimeline/hooks/useTimelineBus'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { ErrorState } from '@/app/utils/useErrorState'

import { EventDeltaDetailsEditorErrors } from './EventDeltaDetailsEditor'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	state: ReturnType<typeof useEventDeltaFields>['state']
	errorState: ErrorState<EventDeltaDetailsEditorErrors>
}

export const useCreateEventDelta = ({ state, errorState }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const navigate = useNavigate({ from: '/world/$worldId' })
	const { eventId } = useParams({
		from: '/world/$worldId/_world/timeline/_timeline/event/$eventId/delta/create',
	})

	const scrollTimelineTo = useTimelineBusDispatch()

	const [createDeltaState, { isLoading: isCreating, isError }] = useCreateWorldEventDeltaMutation()

	const sendRequest = useCallback(async () => {
		const { error } = parseApiResponse(
			await createDeltaState({
				worldId,
				eventId,
				body: {
					name: state.description && state.name ? state.name : null,
					timestamp: String(state.timestamp),
					description: state.description,
					descriptionRich: state.descriptionRich,
				},
			}),
		)
		if (error) {
			errorState.raiseError('DELTA_CREATION_FAILED', error.message)
			return
		}
		errorState.clearError()
		navigate({ to: '/world/$worldId/timeline/outliner', search: { time: state.timestamp } })
		scrollTimelineTo(state.timestamp)
	}, [
		createDeltaState,
		worldId,
		eventId,
		state.description,
		state.name,
		state.timestamp,
		state.descriptionRich,
		errorState,
		navigate,
		scrollTimelineTo,
	])

	const {
		icon: createIcon,
		color: createIconColor,
		manualSave,
	} = useAutosave({
		onSave: sendRequest,
		isSaving: isCreating,
		isError,
	})

	return {
		createIcon,
		createIconColor,
		isCreating,
		createDeltaState: manualSave,
		isError,
	}
}
