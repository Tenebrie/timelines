import { useCallback, useMemo, useRef, useState } from 'react'

import { WorldEventDelta } from '@/app/features/worldTimeline/types'
import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	delta: WorldEventDelta
}

export const useEventDeltaFields = ({ delta }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => (isDirty.current = value), [])

	const [name, setNameDirect] = useState<string | null>(delta.name ?? null)
	const [timestamp, setTimestampDirect] = useState<number>(delta.timestamp)
	const [description, setDescriptionDirect] = useState<string | null>(delta.description ?? null)
	const [descriptionRich, setDescriptionRichDirect] = useState<string | null>(delta.descriptionRich ?? null)

	const setters = useMemo(
		() => ({
			setName: generateSetter(setNameDirect, isDirty),
			setTimestamp: generateSetter(setTimestampDirect, isDirty),
			setDescription: generateSetter(setDescriptionDirect, isDirty),
			setDescriptionRich: generateSetter(setDescriptionRichDirect, isDirty),
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
