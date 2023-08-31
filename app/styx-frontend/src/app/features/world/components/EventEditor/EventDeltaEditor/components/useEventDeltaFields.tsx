import { useState } from 'react'

import { WorldEventDelta } from '../../../../types'

type Props = {
	delta: WorldEventDelta
}

export const useEventDeltaFields = ({ delta }: Props) => {
	const [name, setName] = useState<string | undefined>(delta.name ?? undefined)
	const [timestamp, setTimestamp] = useState<number>(delta.timestamp)
	const [description, setDescription] = useState<string | undefined>(delta.description ?? undefined)
	const [customName, setCustomName] = useState<boolean | undefined>(delta.customName ?? undefined)

	return {
		state: {
			name,
			timestamp,
			description,
			customName,
			setName,
			setTimestamp,
			setDescription,
			setCustomName,
		},
	}
}
