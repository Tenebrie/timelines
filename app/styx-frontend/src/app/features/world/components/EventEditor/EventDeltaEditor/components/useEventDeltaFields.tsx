import { useState } from 'react'

import { WorldEventDelta } from '../../../../types'

type Props = {
	delta: WorldEventDelta
}

export const useEventDeltaFields = ({ delta }: Props) => {
	const [name, setName] = useState<string | null>(delta.name ?? null)
	const [timestamp, setTimestamp] = useState<number>(delta.timestamp)
	const [description, setDescription] = useState<string | null>(delta.description ?? null)

	return {
		state: {
			name,
			timestamp,
			description,
			setName,
			setTimestamp,
			setDescription,
		},
	}
}
