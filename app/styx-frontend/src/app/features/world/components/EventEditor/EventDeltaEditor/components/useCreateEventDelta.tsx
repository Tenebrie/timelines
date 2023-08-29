import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventDeltaMutation } from '../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useWorldRouter } from '../../../../router'
import { getWorldState } from '../../../../selectors'
import { useEventDeltaFields } from './useEventDeltaFields'

type Props = {
	state: ReturnType<typeof useEventDeltaFields>['state']
}

export const useCreateEventDelta = ({ state }: Props) => {
	const { id: worldId } = useSelector(getWorldState)

	const { navigateToOutliner, selectedTime, eventDeltaCreatorParams } = useWorldRouter()

	const [createDeltaState, { isLoading, isError }] = useCreateWorldEventDeltaMutation()

	const sendRequest = useCallback(async () => {
		const { error } = parseApiResponse(
			await createDeltaState({
				worldId,
				eventId: eventDeltaCreatorParams.eventId,
				body: {
					name: state.name,
					timestamp: String(state.timestamp),
					description: state.description,
					customName: state.customName,
				},
			})
		)
		if (error) {
			return
		}
		navigateToOutliner(selectedTime)
	}, [createDeltaState, eventDeltaCreatorParams.eventId, navigateToOutliner, selectedTime, state, worldId])

	return {
		isCreating: isLoading,
		createDeltaState: sendRequest,
		isError,
	}
}
