import { useMemo, useState } from 'react'

import { WorldEventDelta } from '@/app/features/worldTimeline/types'
import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	delta: WorldEventDelta
}

export const useEventDeltaFields = ({ delta }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const [name, setNameDirect] = useState<string | null>(delta.name ?? null)
	const [timestamp, setTimestampDirect] = useState<number>(delta.timestamp)
	const [description, setDescriptionDirect] = useState<string | null>(delta.description ?? null)
	const [descriptionRich, setDescriptionRichDirect] = useState<string | null>(delta.descriptionRich ?? null)

	const setters = useMemo(
		() => ({
			setName: generateSetter(setNameDirect, makeDirty),
			setTimestamp: generateSetter(setTimestampDirect, makeDirty),
			setDescription: generateSetter(setDescriptionDirect, makeDirty),
			setDescriptionRich: generateSetter(setDescriptionRichDirect, makeDirty),
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
