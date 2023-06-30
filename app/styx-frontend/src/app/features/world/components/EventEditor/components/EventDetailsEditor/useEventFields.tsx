import { useState } from 'react'

import { Actor, WorldEvent, WorldEventModule } from '../../../../types'
import { useMapActorsToOptions } from '../../../ActorSelector/useMapActorsToOptions'

type Props = {
	event: WorldEvent
}

export const useEventFields = ({ event }: Props) => {
	const { mapActorsToOptions } = useMapActorsToOptions()

	const [modules, setModules] = useState<WorldEventModule[]>(event.extraFields)
	const [name, setName] = useState<string>(event.name)
	const [icon, setIcon] = useState<string>(event.icon)
	const [timestamp, setTimestamp] = useState<number>(event.timestamp)
	const [revokedAt, setRevokedAt] = useState<number | undefined>(event.revokedAt)
	const [selectedActors, setSelectedActors] = useState<Actor[]>(mapActorsToOptions(event.targetActors))
	const [mentionedActors, setMentionedActors] = useState<Actor[]>(mapActorsToOptions(event.mentionedActors))
	const [description, setDescription] = useState<string>(event.description)
	const [customNameEnabled, setCustomNameEnabled] = useState<boolean>(event.customName)

	return {
		state: {
			modules,
			name,
			icon,
			timestamp,
			revokedAt,
			selectedActors,
			mentionedActors,
			description,
			customNameEnabled,
			setModules,
			setName,
			setIcon,
			setTimestamp,
			setRevokedAt,
			setSelectedActors,
			setMentionedActors,
			setDescription,
			setCustomNameEnabled,
		},
	}
}
