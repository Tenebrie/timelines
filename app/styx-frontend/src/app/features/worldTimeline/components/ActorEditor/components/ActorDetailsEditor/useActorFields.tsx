import { Dispatch, useCallback, useMemo, useRef, useState } from 'react'

import { ActorDetails, MentionDetails } from '@/app/features/worldTimeline/types'

type Props = {
	actor: ActorDetails
}

type SetterArgs = {
	cleanSet?: boolean
}

export const useActorFields = ({ actor }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => (isDirty.current = value), [])

	const [name, setNameDirect] = useState<string>(actor.name)
	const [title, setTitleDirect] = useState<string>(actor.title)
	const [color, setColorDirect] = useState<string>(actor.color)
	const [mentions, setMentionsDirect] = useState<MentionDetails[]>(actor.mentions)
	const [description, setDescriptionDirect] = useState<string>(actor.description)
	const [descriptionRich, setDescriptionRichDirect] = useState<string>(actor.descriptionRich)

	const generateSetter = <T,>(setter: Dispatch<React.SetStateAction<T>>) => {
		return (val: T, args?: SetterArgs) => {
			setter((oldVal) => {
				if (args?.cleanSet) {
					return val
				}
				if (oldVal !== val && !args?.cleanSet) {
					isDirty.current = true
				}

				return val
			})
		}
	}

	const setters = useMemo(
		() => ({
			setName: generateSetter(setNameDirect),
			setTitle: generateSetter(setTitleDirect),
			setColor: generateSetter(setColorDirect),
			setMentions: generateSetter(setMentionsDirect),
			setDescription: generateSetter(setDescriptionDirect),
			setDescriptionRich: generateSetter(setDescriptionRichDirect),
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
