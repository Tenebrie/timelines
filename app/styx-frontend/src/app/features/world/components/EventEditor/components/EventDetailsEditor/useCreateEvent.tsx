import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useWorldRouter } from '../../../../router'
import { getWorldState } from '../../../../selectors'
import { useEventFields } from './useEventFields'

type Props = {
	state: ReturnType<typeof useEventFields>['state']
}

export const useCreateEvent = ({ state }: Props) => {
	const { id: worldId } = useSelector(getWorldState)

	const { navigateToOutliner, selectedTime } = useWorldRouter()

	const [createWorldEvent, { isLoading, isError }] = useCreateWorldEventMutation()

	const sendRequest = useCallback(async () => {
		const { error } = parseApiResponse(
			await createWorldEvent({
				worldId,
				body: {
					type: 'SCENE',
					modules: state.modules,
					name: state.name,
					icon: state.icon,
					timestamp: String(state.timestamp),
					replacedEventId: state.replacedEvent?.id ?? null,
					revokedAt: state.revokedAt ? String(state.revokedAt) : null,
					description: state.description,
					customNameEnabled: state.customNameEnabled,
					targetActorIds: state.selectedActors.map((a) => a.id),
					mentionedActorIds: state.mentionedActors.map((a) => a.id),
				},
			})
		)
		if (error) {
			return
		}
		navigateToOutliner(selectedTime)
	}, [createWorldEvent, navigateToOutliner, selectedTime, state, worldId])

	return {
		isCreating: isLoading,
		createWorldEvent: sendRequest,
		isError,
	}
}
