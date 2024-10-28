import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { useWorldRouter, worldRoutes } from '../../../../../../../router/routes/worldRoutes'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { worldSlice } from '../../../../reducer'
import { WorldEvent } from '../../../../types'
import { useMapActorsToOptions } from '../../../ActorSelector/useMapActorsToOptions'
import { useEventFields } from './useEventFields'

type Props = {
	mode: 'create' | 'edit'
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
		customNameEnabled,
		setDirty,
		setModules,
		setName,
		setIcon,
		setTimestamp,
		setRevokedAt,
		setSelectedActors,
		setMentionedActors,
		setDescription,
		setCustomNameEnabled,
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
			setCustomNameEnabled(event.customName, { cleanSet: true })

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
	])

	const { openDeleteEventModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateWorldEvent, { isLoading: isSaving, isError }] = useUpdateWorldEventMutation()

	const { stateOf } = useWorldRouter()
	const { worldId } = stateOf(worldRoutes.eventEditor)

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
				revokedAt: revokedAt ? String(revokedAt) : null,
				description,
				customNameEnabled,
				targetActorIds: selectedActors.map((a) => a.id),
				mentionedActorIds: mentionedActors.map((a) => a.id),
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
		dispatch(openDeleteEventModal(event))
	}, [dispatch, event, openDeleteEventModal])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
