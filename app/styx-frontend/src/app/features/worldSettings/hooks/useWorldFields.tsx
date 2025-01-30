import { useCallback, useMemo, useRef, useState } from 'react'

import { WorldBrief } from '@/app/features/worldTimeline/types'
import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	world: WorldBrief
}

export const useWorldFields = ({ world }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => (isDirty.current = value), [])

	const [name, setName] = useState(world.name)
	const [description, setDescription] = useState(world.description)
	const [calendar, setCalendar] = useState(world.calendar)

	const setters = useMemo(
		() => ({
			setName: generateSetter(setName, isDirty),
			setDescription: generateSetter(setDescription, isDirty),
			setCalendar: generateSetter(setCalendar, isDirty),
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
