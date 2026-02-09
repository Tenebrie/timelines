import { WorldDetails } from '@api/types/worldTypes'
import { useCallback, useMemo, useRef, useState } from 'react'

import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	world: WorldDetails
}

export const useSettingsDraft = ({ world }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const currentId = useRef(world.id)
	const currentUpdatedAt = useRef(world.updatedAt)
	const [name, setName] = useState(world.name)
	const [description, setDescription] = useState(world.description)
	const [calendars, setCalendars] = useState(world.calendars.map((c) => c.id))

	const setters = useMemo(
		() => ({
			setName: generateSetter(setName, makeDirty),
			setDescription: generateSetter(setDescription, makeDirty),
			setCalendars: generateSetter(setCalendars, makeDirty),
		}),
		[],
	)

	const loadState = useCallback(
		(loadedState: { name: string; description: string; calendars: string[] }) => {
			setDirty(false)
			setters.setName(loadedState.name, { cleanSet: true })
			setters.setDescription(loadedState.description, { cleanSet: true })
			setters.setCalendars(loadedState.calendars, { cleanSet: true })
		},
		[setDirty, setters],
	)

	const loadWorld = useCallback(
		(world: WorldDetails) => {
			currentId.current = world.id
			currentUpdatedAt.current = world.updatedAt
			loadState({
				...world,
				calendars: world.calendars.map((c) => c.id),
			})
		},
		[loadState],
	)

	if (currentId.current !== world.id) {
		loadWorld(world)
	}

	if (currentId.current === world.id && world.updatedAt > currentUpdatedAt.current) {
		loadWorld(world)
	}

	return {
		isDirty,
		name,
		description,
		calendars,
		setDirty,
		...setters,
	}
}
