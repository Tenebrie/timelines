import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateWorldEventDeltaMutation } from '@/api/worldEventDeltaApi'
import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { useTimelineBusDispatch } from '@/app/features/worldTimeline/hooks/useTimelineBus'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { ErrorState } from '@/app/utils/useErrorState'
import {
	useWorldTimelineRouter,
	worldTimelineRoutes,
} from '@/router/routes/featureRoutes/worldTimelineRoutes'

import { EventDeltaDetailsEditorErrors } from './EventDeltaDetailsEditor'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	state: ReturnType<typeof useEventDeltaFields>['state']
	errorState: ErrorState<EventDeltaDetailsEditorErrors>
}

export const useCreateEventDelta = ({ state, errorState }: Props) => {
	const worldId = useSelector(getWorldIdState)

	const { stateOf, navigateToOutliner } = useWorldTimelineRouter()
	const { eventId } = stateOf(worldTimelineRoutes.eventDeltaCreator)
	const scrollTimelineTo = useTimelineBusDispatch()

	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

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
		navigateToOutliner()
		scrollTimelineTo(state.timestamp)
		dispatch(setSelectedTime(state.timestamp))
	}, [
		createDeltaState,
		worldId,
		eventId,
		state,
		errorState,
		scrollTimelineTo,
		navigateToOutliner,
		dispatch,
		setSelectedTime,
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
