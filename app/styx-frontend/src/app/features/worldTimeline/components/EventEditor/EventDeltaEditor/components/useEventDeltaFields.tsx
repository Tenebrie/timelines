import { Dispatch, useCallback, useMemo, useRef, useState } from 'react'

import { WorldEventDelta } from '@/app/features/worldTimeline/types'

type Props = {
	delta: WorldEventDelta
}

type SetterArgs = {
	cleanSet?: boolean
}

export const useEventDeltaFields = ({ delta }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => (isDirty.current = value), [])

	const [name, setNameDirect] = useState<string | null>(delta.name ?? null)
	const [timestamp, setTimestampDirect] = useState<number>(delta.timestamp)
	const [description, setDescriptionDirect] = useState<string | null>(delta.description ?? null)
	const [descriptionRich, setDescriptionRichDirect] = useState<string | null>(delta.descriptionRich ?? null)

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
			setTimestamp: generateSetter(setTimestampDirect),
			setDescription: generateSetter(setDescriptionDirect),
			setDescriptionRich: generateSetter(setDescriptionRichDirect),
		}),
		[],
	)

	return {
		state: {
			isDirty,
			name,
			timestamp,
			description,
			descriptionRich,
			setDirty,
			...setters,
		},
	}
}
