import { ActorDetails, MentionDetails } from '@api/types/types'
import { useCallback, useMemo, useRef, useState } from 'react'

import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	actor: ActorDetails
}

export type ActorDraft = ReturnType<typeof useActorDraft>

export const useActorDraft = ({ actor }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const currentId = useRef(actor.id)
	const [key, setKey] = useState(0)
	const [id, setIdDirect] = useState<string>(actor.id)
	const [name, setNameDirect] = useState<string>(actor.name)
	const [title, setTitleDirect] = useState<string>(actor.title)
	const [color, setColorDirect] = useState<string>(actor.color)
	const [mentions, setMentionsDirect] = useState<MentionDetails[]>(actor.mentions)
	const [description, setDescriptionDirect] = useState<string>(actor.description)
	const [descriptionRich, setDescriptionRichDirect] = useState<string>(actor.descriptionRich)

	const setters = useMemo(
		() => ({
			setId: generateSetter(setIdDirect, makeDirty),
			setName: generateSetter(setNameDirect, makeDirty),
			setTitle: generateSetter(setTitleDirect, makeDirty),
			setColor: generateSetter(setColorDirect, makeDirty),
			setMentions: generateSetter(setMentionsDirect, makeDirty),
			setDescription: generateSetter(setDescriptionDirect, makeDirty),
			setDescriptionRich: generateSetter(setDescriptionRichDirect, makeDirty),
		}),
		[],
	)

	const loadState = useCallback(
		(loadedState: {
			id: string
			name: string
			title: string
			color: string
			mentions: MentionDetails[]
			description: string
			descriptionRich: string
		}) => {
			setDirty(false)
			setters.setId(loadedState.id, { cleanSet: true })
			setters.setName(loadedState.name, { cleanSet: true })
			setters.setTitle(loadedState.title, { cleanSet: true })
			setters.setColor(loadedState.color, { cleanSet: true })
			setters.setMentions(loadedState.mentions, { cleanSet: true })
			setters.setDescription(loadedState.description, { cleanSet: true })
			setters.setDescriptionRich(loadedState.descriptionRich, { cleanSet: true })
			setKey((prev) => prev + 1)
		},
		[setters],
	)

	const loadActor = useCallback(
		(actor: ActorDetails) => {
			loadState(actor)
			currentId.current = actor.id
		},
		[loadState],
	)

	const toPayload = useCallback(() => {
		return {
			id,
			name,
			title,
			color,
			mentions,
			description,
			descriptionRich,
		}
	}, [id, name, title, color, mentions, description, descriptionRich])

	if (currentId.current !== actor.id) {
		loadActor(actor)
	}

	return {
		isDirty,
		key,
		id,
		name,
		title,
		color,
		mentions,
		description,
		descriptionRich,
		setDirty,
		...setters,
		loadState,
		loadActor,
		toPayload,
	}
}
