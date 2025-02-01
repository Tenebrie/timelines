import { useCallback, useMemo, useRef, useState } from 'react'

import { Actor, ActorDetails, MentionDetails } from '@/app/features/worldTimeline/types'
import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	actor: ActorDetails
}

export const useActorFields = ({ actor }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => {
		isDirty.current = value
	}, [])

	const [name, setNameDirect] = useState<string>(actor.name)
	const [title, setTitleDirect] = useState<string>(actor.title)
	const [color, setColorDirect] = useState<string>(actor.color)
	const [mentions, setMentionsDirect] = useState<MentionDetails[]>(actor.mentions)
	const [description, setDescriptionDirect] = useState<string>(actor.description)
	const [descriptionRich, setDescriptionRichDirect] = useState<string>(actor.descriptionRich)

	const setters = useMemo(
		() => ({
			setName: generateSetter(setNameDirect, isDirty),
			setTitle: generateSetter(setTitleDirect, isDirty),
			setColor: generateSetter(setColorDirect, isDirty),
			setMentions: generateSetter(setMentionsDirect, isDirty),
			setDescription: generateSetter(setDescriptionDirect, isDirty),
			setDescriptionRich: generateSetter(setDescriptionRichDirect, isDirty),
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
