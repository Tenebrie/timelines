import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { UpdateWorldEventApiArg, useUpdateWorldEventMutation } from '../../../../../../../api/rheaApi'
import { arraysEqual } from '../../../../../../utils/arraysEqual'
import { useAutosave } from '../../../../../../utils/autosave/useAutosave'
import { ingestNestedEvent } from '../../../../../../utils/ingestEvent'
import { parseApiResponse } from '../../../../../../utils/parseApiResponse'
import { useIsFirstRender } from '../../../../../../utils/useIsFirstRender'
import { worldSlice } from '../../../../reducer'
import { useWorldRouter } from '../../../../router'
import { WorldEvent } from '../../../../types'
import { useMapActorsToOptions } from '../../../ActorSelector/useMapActorsToOptions'
import { useEventFields } from './useEventFields'

type Props = {
	mode: 'create' | 'edit'
	event: WorldEvent
	state: ReturnType<typeof useEventFields>['state']
}

type SavedEvent = Pick<
	WorldEvent,
	| 'extraFields'
	| 'name'
	| 'icon'
	| 'timestamp'
	| 'revokedAt'
	| 'description'
	| 'customName'
	| 'targetActors'
	| 'mentionedActors'
	| 'replaces'
>

export const useEditEvent = ({ mode, event, state }: Props) => {
	const { mapActorsToOptions } = useMapActorsToOptions()

	const {
		modules,
		name,
		icon,
		timestamp,
		revokedAt,
		replacedEvent,
		selectedActors,
		mentionedActors,
		description,
		customNameEnabled,
		setModules,
		setName,
		setIcon,
		setTimestamp,
		setRevokedAt,
		setReplacedEvent,
		setSelectedActors,
		setMentionedActors,
		setDescription,
		setCustomNameEnabled,
	} = state

	const savingEnabled = useRef<boolean>(true)
	const lastSaved = useRef<SavedEvent>(event)
	const lastSavedAt = useRef<Date>(new Date(event.updatedAt))

	useEffect(() => {
		if (new Date(event.updatedAt) > lastSavedAt.current) {
			setModules(event.extraFields)
			setName(event.name)
			setIcon(event.icon)
			setTimestamp(event.timestamp)
			setRevokedAt(event.revokedAt)
			setReplacedEvent(event.replaces)
			setSelectedActors(mapActorsToOptions(event.targetActors))
			setMentionedActors(mapActorsToOptions(event.mentionedActors))
			setDescription(event.description)
			setCustomNameEnabled(event.customName)
			savingEnabled.current = false
		}
	}, [
		event,
		mapActorsToOptions,
		setDescription,
		setIcon,
		setMentionedActors,
		setModules,
		setName,
		setRevokedAt,
		setReplacedEvent,
		setSelectedActors,
		setTimestamp,
		setCustomNameEnabled,
	])

	const { openDeleteEventModal } = worldSlice.actions
	const dispatch = useDispatch()

	const [updateWorldEvent, { isLoading: isSaving, isError }] = useUpdateWorldEventMutation()

	const { eventEditorParams } = useWorldRouter()
	const { worldId } = eventEditorParams

	const sendUpdate = useCallback(
		async (delta: UpdateWorldEventApiArg['body']) => {
			const { response, error } = parseApiResponse(
				await updateWorldEvent({
					worldId: worldId,
					eventId: event.id,
					body: delta,
				})
			)
			if (error) {
				return
			}
			lastSaved.current = {
				...response,
				timestamp: Number(response.timestamp),
				revokedAt: Number(response.revokedAt),
				replaces: ingestNestedEvent(response.replaces),
			}
			lastSavedAt.current = new Date()
		},
		[event.id, updateWorldEvent, worldId]
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
				replacedEventId: replacedEvent ? replacedEvent.id : null,
				description,
				customNameEnabled,
				targetActorIds: selectedActors.map((a) => a.id),
				mentionedActorIds: mentionedActors.map((a) => a.id),
			}),
		isSaving,
		isError,
	})

	const { isFirstRender } = useIsFirstRender()
	useEffect(() => {
		if (!savingEnabled.current || mode !== 'edit') {
			savingEnabled.current = true
			return
		}
		if (
			isFirstRender ||
			(arraysEqual(lastSaved.current.extraFields, modules, (a, b) => a === b) &&
				lastSaved.current.name === name &&
				lastSaved.current.icon === icon &&
				lastSaved.current.timestamp === timestamp &&
				lastSaved.current.revokedAt === revokedAt &&
				lastSaved.current.replaces?.id === replacedEvent?.id &&
				lastSaved.current.description === description &&
				lastSaved.current.customName === customNameEnabled &&
				arraysEqual(lastSaved.current.targetActors, selectedActors, (a, b) => a.id === b.id) &&
				arraysEqual(lastSaved.current.mentionedActors, mentionedActors, (a, b) => a.id === b.id))
		) {
			return
		}

		autosave()
	}, [
		modules,
		name,
		icon,
		timestamp,
		revokedAt,
		description,
		customNameEnabled,
		selectedActors,
		mentionedActors,
		sendUpdate,
		isFirstRender,
		autosave,
		mode,
		replacedEvent?.id,
	])

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
