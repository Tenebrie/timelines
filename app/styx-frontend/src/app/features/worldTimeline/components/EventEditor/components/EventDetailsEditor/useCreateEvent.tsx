import { useCreateWorldEventMutation } from '@api/worldEventApi'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldIdState } from '@/app/features/world/selectors'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { useEventFields } from './useEventFields'

type Props = {
	state: ReturnType<typeof useEventFields>['state']
	onCreated: () => void
}

export const useCreateEvent = ({ state, onCreated }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const navigate = useNavigate({ from: '/world/$worldId' })

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	const [createWorldEvent, { isLoading: isCreating, isError }] = useCreateWorldEventMutation()

	const sendRequest = useCallback(async () => {
		const { error } = parseApiResponse(
			await createWorldEvent({
				worldId,
				body: {
					name: state.name,
					icon: state.icon,
					timestamp: String(state.timestamp),
					revokedAt: state.revokedAt ? String(state.revokedAt) : null,
					description: state.description,
					descriptionRich: state.descriptionRich,
					customName: state.customNameEnabled,
					mentions: state.mentions,
					externalLink: state.externalLink,
				},
			}),
		)
		if (error) {
			return
		}
		scrollTimelineTo({ timestamp: state.timestamp })
		navigate({ to: '/world/$worldId/timeline', search: { time: state.timestamp } })
		onCreated()
	}, [
		createWorldEvent,
		worldId,
		state.name,
		state.icon,
		state.timestamp,
		state.revokedAt,
		state.description,
		state.descriptionRich,
		state.customNameEnabled,
		state.mentions,
		state.externalLink,
		scrollTimelineTo,
		navigate,
		onCreated,
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
