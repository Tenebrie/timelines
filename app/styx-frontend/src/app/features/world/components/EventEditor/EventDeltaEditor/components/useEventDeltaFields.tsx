import { useState } from 'react'

import { WorldEventDelta } from '../../../../types'

type Props = {
	delta: WorldEventDelta
}

export const useEventDeltaFields = ({ delta }: Props) => {
	const [name, setName] = useState<string>(delta.name ?? '')
	const [timestamp, setTimestamp] = useState<number>(delta.timestamp)
	const [description, setDescription] = useState<string>(delta.description ?? '')
	const [customName, setCustomName] = useState<boolean>(delta.customName ?? false)

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
