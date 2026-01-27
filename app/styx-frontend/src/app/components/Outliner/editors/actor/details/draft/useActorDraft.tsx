import { ActorDetails } from '@api/types/worldTypes'
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
	const [icon, setIconDirect] = useState<string>(actor.icon)
	const [title, setTitleDirect] = useState<string>(actor.title)
	const [color, setColorDirect] = useState<string>(actor.color)

	const setters = useMemo(
		() => ({
			setId: generateSetter(setIdDirect, makeDirty),
			setName: generateSetter(setNameDirect, makeDirty),
			setIcon: generateSetter(setIconDirect, makeDirty),
			setTitle: generateSetter(setTitleDirect, makeDirty),
			setColor: generateSetter(setColorDirect, makeDirty),
		}),
		[],
	)

	const loadState = useCallback(
		(loadedState: { id: string; name: string; icon: string; title: string; color: string }) => {
			setDirty(false)
			setters.setId(loadedState.id, { cleanSet: true })
			setters.setName(loadedState.name, { cleanSet: true })
			setters.setIcon(loadedState.icon, { cleanSet: true })
			setters.setTitle(loadedState.title, { cleanSet: true })
			setters.setColor(loadedState.color, { cleanSet: true })
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
			icon,
			title,
			color,
		}
	}, [id, name, icon, title, color])

	if (currentId.current !== actor.id) {
		loadActor(actor)
	}

	return {
		isDirty,
		key,
		id,
		name,
		icon,
		title,
		color,
		setDirty,
		...setters,
		loadState,
		loadActor,
		toPayload,
	}
}
