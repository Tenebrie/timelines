import { WorldBrief } from '@api/types/worldTypes'
import { useMemo, useState } from 'react'

import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	world: WorldBrief
}

export const useSettingsDraft = ({ world }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const [name, setName] = useState(world.name)
	const [description, setDescription] = useState(world.description)
	const [calendar, setCalendar] = useState(world.calendar)

	const setters = useMemo(
		() => ({
			setName: generateSetter(setName, makeDirty),
			setDescription: generateSetter(setDescription, makeDirty),
			setCalendar: generateSetter(setCalendar, makeDirty),
		}),
		[],
	)

	return {
		isDirty,
		name,
		description,
		calendar,
		setDirty,
		...setters,
	}
}
