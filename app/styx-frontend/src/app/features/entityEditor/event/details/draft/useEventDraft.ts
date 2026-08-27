import { WorldEvent } from '@api/types/worldTypes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	event: WorldEvent
}

export type EventDraft = ReturnType<typeof useEventDraft>

export const useEventDraft = ({ event }: Props) => {
	const [isDirty, setDirty] = useState(false)
	const makeDirty = () => setDirty(true)

	const currentId = useRef(event.id)
	const currentUpdatedAt = useRef(event.updatedAt)
	const [key, setKey] = useState(0)
	const [id, setIdDirect] = useState<string>(event.id)
	const [name, setNameDirect] = useState<string>(event.name)
	const [icon, setIconDirect] = useState<string>(event.icon)
	const [color, setColorDirect] = useState<string>(event.color)
	const [timestamp, setTimestampDirect] = useState<number>(event.timestamp)
	const [revokedAt, setRevokedAtDirect] = useState<number | undefined>(event.revokedAt)

	const setters = useMemo(
		() => ({
			setId: generateSetter(setIdDirect, makeDirty),
			setName: generateSetter(setNameDirect, makeDirty),
			setIcon: generateSetter(setIconDirect, makeDirty),
			setColor: generateSetter(setColorDirect, makeDirty),
			setTimestamp: generateSetter(setTimestampDirect, makeDirty),
			setRevokedAt: generateSetter(setRevokedAtDirect, makeDirty),
		}),
		[],
	)

	const loadState = useCallback(
		(loadedState: {
			id: string
			name: string
			timestamp: number
			icon: string
			color: string
			revokedAt?: number | undefined
		}) => {
			setDirty(false)
			setters.setId(loadedState.id, { cleanSet: true })
			setters.setName(loadedState.name, { cleanSet: true })
			setters.setTimestamp(loadedState.timestamp, { cleanSet: true })
			setters.setIcon(loadedState.icon, { cleanSet: true })
			setters.setColor(loadedState.color, { cleanSet: true })
			setters.setRevokedAt(loadedState.revokedAt, { cleanSet: true })
			setKey((prev) => prev + 1)
		},
		[setDirty, setters],
	)

	const loadEvent = useCallback(
		(event: WorldEvent) => {
			currentId.current = event.id
			currentUpdatedAt.current = event.updatedAt
			loadState(event)
		},
		[loadState],
	)

	useEffect(() => {
		setters.setTimestamp(event.timestamp, { cleanSet: true })
	}, [event.timestamp, setters])

	const toPayload = useCallback(() => {
		return {
			id,
			name,
			icon,
			color,
			timestamp: String(timestamp),
			revokedAt: revokedAt ? String(revokedAt) : null,
		}
	}, [id, name, icon, color, timestamp, revokedAt])

	if (currentId.current !== event.id) {
		loadEvent(event)
	}

	if (currentId.current === event.id && event.updatedAt > currentUpdatedAt.current) {
		loadEvent(event)
	}

	return {
		isDirty,
		key,
		id,
		name,
		icon,
		color,
		timestamp,
		revokedAt,
		setDirty,
		bumpKey: () => setKey((prev) => prev + 1),
		...setters,
		loadState,
		loadEvent,
		resetUpdatedAt: (updatedAt: string) => {
			currentUpdatedAt.current = updatedAt
		},
		toPayload,
	}
}
