import { UpdateActorApiArg, useUpdateActorMutation } from '@api/actorListApi'
import { Actor } from '@api/types/types'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/reducer'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { useActorFields } from './useActorFields'

type Props = {
	actor: Actor
	state: ReturnType<typeof useActorFields>['state']
}

export const useEditActor = ({ actor, state }: Props) => {
	const {
		isDirty,
		name,
		title,
		color,
		mentions,
		description,
		descriptionRich,
		setDirty,
		setName,
		setTitle,
		setColor,
		setMentions,
		setDescription,
		setDescriptionRich,
	} = state

	const lastSavedAt = useRef<Date>(new Date(actor.updatedAt))

	useEffect(() => {
		if (new Date(actor.updatedAt) > lastSavedAt.current) {
			setName(actor.name, { cleanSet: true })
			setTitle(actor.title, { cleanSet: true })
			setColor(actor.color, { cleanSet: true })
			setMentions(actor.mentions, { cleanSet: true })
			setDescription(actor.description, { cleanSet: true })
			setDescriptionRich(actor.descriptionRich, { cleanSet: true })

			setDirty(false)
			lastSavedAt.current = new Date(actor.updatedAt)
		}
	}, [actor, setColor, setMentions, setDescription, setDescriptionRich, setDirty, setName, setTitle])

	const { open: openDeleteActorModal } = useModal('deleteActorModal')

	const [updateActor, { isLoading: isSaving }] = useUpdateActorMutation()

	const worldId = useSelector(getWorldIdState)

	const sendUpdate = useCallback(
		async (delta: UpdateActorApiArg['body']) => {
			setDirty(false)
			const { error } = parseApiResponse(
				await updateActor({
					worldId: worldId,
					actorId: actor.id,
					body: delta,
				}),
			)
			if (error) {
				return
			}
			lastSavedAt.current = new Date()
		},
		[actor.id, setDirty, updateActor, worldId],
	)

	const {
		icon: autosaveIcon,
		color: autosaveColor,
		autosave,
		manualSave,
	} = useAutosave({
		onSave: () =>
			sendUpdate({
				name,
				title,
				color,
				mentions,
				description,
				descriptionRich,
			}),
		isSaving,
	})

	useEffect(() => {
		if (isDirty) {
			autosave()
		}
	}, [state, autosave, isDirty])

	const onDelete = useCallback(() => {
		openDeleteActorModal({ target: actor })
	}, [actor, openDeleteActorModal])

	return {
		isSaving,
		manualSave,
		onDelete,
		autosaveIcon,
		autosaveColor,
	}
}
