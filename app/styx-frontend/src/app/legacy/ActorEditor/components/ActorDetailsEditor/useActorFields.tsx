import { Actor, ActorDetails, MentionDetails } from '@api/types/worldTypes'
import { useMemo, useState } from 'react'

import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	actor: ActorDetails
}

export const useActorFields = ({ actor }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const [name, setNameDirect] = useState<string>(actor.name)
	const [title, setTitleDirect] = useState<string>(actor.title)
	const [color, setColorDirect] = useState<string>(actor.color)
	const [mentions, setMentionsDirect] = useState<MentionDetails[]>(actor.mentions)
	const [description, setDescriptionDirect] = useState<string>(actor.description)
	const [descriptionRich, setDescriptionRichDirect] = useState<string>(actor.descriptionRich)

	const setters = useMemo(
		() => ({
			setName: generateSetter(setNameDirect, makeDirty),
			setTitle: generateSetter(setTitleDirect, makeDirty),
			setColor: generateSetter(setColorDirect, makeDirty),
			setMentions: generateSetter(setMentionsDirect, makeDirty),
			setDescription: generateSetter(setDescriptionDirect, makeDirty),
			setDescriptionRich: generateSetter(setDescriptionRichDirect, makeDirty),
		}),
		[],
	)

	const loadState = (loadedState: {
		name: string
		title: string
		color: string
		mentions: MentionDetails[]
		description: string
		descriptionRich: string
	}) => {
		setDirty(false)
		setters.setName(loadedState.name, { cleanSet: true })
		setters.setTitle(loadedState.title, { cleanSet: true })
		setters.setColor(loadedState.color, { cleanSet: true })
		setters.setMentions(loadedState.mentions, { cleanSet: true })
		setters.setDescription(loadedState.description, { cleanSet: true })
		setters.setDescriptionRich(loadedState.descriptionRich, { cleanSet: true })
	}

	const loadActor = (actor: Actor) => {
		loadState(actor)
	}

	return {
		state: {
			isDirty,
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
		},
	}
}
