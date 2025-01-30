import { useCallback, useMemo, useRef, useState } from 'react'

import { ActorDetails, MentionDetails } from '@/app/features/worldTimeline/types'
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
		},
	}
}
