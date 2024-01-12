import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventDeltaMutation } from '../../../../../../../api/rheaApi'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { ErrorState } from '../../../../../../utils/useErrorState'
import { getWorldState } from '../../../../selectors'
import { EventDeltaDetailsEditorErrors } from './EventDeltaDetailsEditor'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	state: ReturnType<typeof useEventDeltaFields>['state']
	errorState: ErrorState<EventDeltaDetailsEditorErrors>
}

export const useCreateEventDelta = ({ state, errorState }: Props) => {
	const { id: worldId } = useSelector(getWorldState)

	const { navigateToOutliner, selectedTimeOrZero, stateOf } = useWorldRouter()
	const { eventId } = stateOf(worldRoutes.eventDeltaCreator)

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
				},
			})
		)
		if (error) {
			errorState.raiseError('DELTA_CREATION_FAILED', error.message)
			return
		}
		errorState.clearError()
		navigateToOutliner(selectedTimeOrZero)
	}, [createDeltaState, eventId, navigateToOutliner, selectedTimeOrZero, state, worldId, errorState])

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
