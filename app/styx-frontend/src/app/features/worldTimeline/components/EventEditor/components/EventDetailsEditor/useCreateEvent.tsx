import { useCreateWorldEventMutation } from '@api/worldEventApi'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '@/app/features/world/reducer'
import { getWorldIdState } from '@/app/features/world/selectors'
import { useTimelineBusDispatch } from '@/app/features/worldTimeline/hooks/useTimelineBus'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useWorldTimelineRouter } from '@/router/routes/featureRoutes/worldTimelineRoutes'

import { useEventFields } from './useEventFields'

type Props = {
	state: ReturnType<typeof useEventFields>['state']
	onCreated: () => void
}

export const useCreateEvent = ({ state, onCreated }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const { navigateToOutliner } = useWorldTimelineRouter()

	const scrollTimelineTo = useTimelineBusDispatch()
	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()

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
					descriptionRich: state.descriptionRich,
					customNameEnabled: state.customNameEnabled,
					mentions: state.mentions,
					externalLink: state.externalLink,
				},
			}),
		)
		if (error) {
			return
		}
		scrollTimelineTo(state.timestamp)
		navigateToOutliner()
		dispatch(setSelectedTime(state.timestamp))
		onCreated()
	}, [
		createWorldEvent,
		scrollTimelineTo,
		state,
		worldId,
		navigateToOutliner,
		onCreated,
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
		createWorldEvent: manualSave,
		isError,
	}
}
