import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '@/api/worldEventApi'
import { useModal } from '@/app/features/modals/reducer'
import { useMapActorsToOptions } from '@/app/features/worldTimeline/components/ActorSelector/useMapActorsToOptions'
import { getWorldIdState } from '@/app/features/worldTimeline/selectors'
import { WorldEvent } from '@/app/features/worldTimeline/types'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { isNotNull } from '@/app/utils/isNotNull'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { useEventFields } from './useEventFields'

type Props = {
	mode: 'create' | 'create-compact' | 'edit'
	event: WorldEvent
	state: ReturnType<typeof useEventFields>['state']
}

export const useEditEvent = ({ mode, event, state }: Props) => {
	const { mapActorsToOptions } = useMapActorsToOptions()

	const {
		isDirty,
		modules,
		name,
		icon,
		timestamp,
		revokedAt,
		selectedActors,
		mentionedActors,
		description,
		descriptionRich,
		customNameEnabled,
		externalLink,
		setDirty,
		setModules,
		setName,
		setIcon,
		setTimestamp,
		setRevokedAt,
		setSelectedActors,
		setMentionedActors,
		setDescription,
		setDescriptionRich,
		setCustomNameEnabled,
		setExternalLink,
	} = state

	const lastSavedAt = useRef<Date>(new Date(event.updatedAt))

	useEffect(() => {
		if (new Date(event.updatedAt) > lastSavedAt.current) {
			setModules(event.extraFields, { cleanSet: true })
			setName(event.name, { cleanSet: true })
			setIcon(event.icon, { cleanSet: true })
			setTimestamp(event.timestamp, { cleanSet: true })
			setRevokedAt(event.revokedAt, { cleanSet: true })
			setSelectedActors(mapActorsToOptions(event.targetActors), { cleanSet: true })
			setMentionedActors(mapActorsToOptions(event.mentionedActors), { cleanSet: true })
			setDescription(event.description, { cleanSet: true })
			setDescriptionRich(event.descriptionRich, { cleanSet: true })
			setCustomNameEnabled(event.customName, { cleanSet: true })
			setExternalLink(event.externalLink, { cleanSet: true })

			setDirty(false)
			lastSavedAt.current = new Date(event.updatedAt)
		}
	}, [
		event,
		mapActorsToOptions,
		setIcon,
		setMentionedActors,
		setModules,
		setName,
		setRevokedAt,
		setSelectedActors,
		setTimestamp,
		setCustomNameEnabled,
		setDirty,
		setDescription,
		setDescriptionRich,
		setExternalLink,
	])

	const { open: openDeleteEventModal } = useModal('deleteEventModal')

	const [updateWorldEvent, { isLoading: isSaving, isError }] = useUpdateWorldEventMutation()

	const worldId = useSelector(getWorldIdState)

	const sendUpdate = useCallback(
		async (delta: UpdateWorldEventApiArg['body']) => {
			setDirty(false)
			const { error } = parseApiResponse(
				await updateWorldEvent({
					worldId: worldId,
					eventId: event.id,
					body: delta,
				}),
			)
			if (error) {
				return
			}
			lastSavedAt.current = new Date()
		},
		[event.id, setDirty, updateWorldEvent, worldId],
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				modules,
				name,
				icon,
				timestamp: String(timestamp),
				revokedAt: isNotNull(revokedAt) ? String(revokedAt) : null,
				description,
				descriptionRich,
				customNameEnabled,
				targetActorIds: selectedActors.map((a) => a.id),
				mentionedActorIds: mentionedActors.map((a) => a.id),
				externalLink,
			}),
		isSaving,
		isError,
	})

	useEffect(() => {
		if (mode === 'edit' && isDirty.current) {
			autosave()
		}
	}, [autosave, isDirty, mode, state])

	const onDelete = useCallback(() => {
		openDeleteEventModal({ target: event })
	}, [event, openDeleteEventModal])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
