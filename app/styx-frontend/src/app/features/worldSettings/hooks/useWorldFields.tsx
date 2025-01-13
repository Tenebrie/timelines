import { Dispatch, useCallback, useMemo, useRef, useState } from 'react'

import { WorldBrief } from '@/app/features/worldTimeline/types'

type Props = {
	world: WorldBrief
}

type SetterArgs = {
	cleanSet?: boolean
}

export const useWorldFields = ({ world }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => (isDirty.current = value), [])

	const [name, setName] = useState(world.name)
	const [description, setDescription] = useState(world.description)
	const [calendar, setCalendar] = useState(world.calendar)

	const generateSetter = useCallback(<T,>(setter: Dispatch<React.SetStateAction<T>>) => {
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
	}, [])

	const setters = useMemo(
		() => ({
			setName: generateSetter(setName),
			setDescription: generateSetter(setDescription),
			setCalendar: generateSetter(setCalendar),
		}),
		[generateSetter],
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
