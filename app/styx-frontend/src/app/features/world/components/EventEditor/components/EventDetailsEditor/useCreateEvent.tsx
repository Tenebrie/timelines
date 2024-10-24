import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useCreateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { getWorldState } from '../../../../selectors'
import { useEventFields } from './useEventFields'

type Props = {
	state: ReturnType<typeof useEventFields>['state']
}

export const useCreateEvent = ({ state }: Props) => {
	const { id: worldId } = useSelector(getWorldState)

	const { navigateToOutliner, selectedTimeOrZero } = useWorldRouter()

	const [createWorldEvent, { isLoading: isCreating, isError }] = useCreateWorldEventMutation()

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
		navigateToOutliner(selectedTimeOrZero)
	}, [createWorldEvent, navigateToOutliner, selectedTimeOrZero, state, worldId])

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
		createWorldEvent: manualSave,
		isError,
	}
}
