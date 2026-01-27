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
	const [key, setKey] = useState(0)
	const [id, setIdDirect] = useState<string>(event.id)
	const [modules, setModulesDirect] = useState<typeof event.extraFields>(event.extraFields)
	const [name, setNameDirect] = useState<string>(event.name)
	const [icon, setIconDirect] = useState<string>(event.icon)
	const [color, setColorDirect] = useState<string>(event.color)
	const [timestamp, setTimestampDirect] = useState<number>(event.timestamp)
	const [revokedAt, setRevokedAtDirect] = useState<number | undefined>(event.revokedAt)
	const [customName, setCustomNameDirect] = useState<boolean>(event.customName)
	const [externalLink, setExternalLink] = useState<string>(event.externalLink)

	const setters = useMemo(
		() => ({
			setId: generateSetter(setIdDirect, makeDirty),
			setModules: generateSetter(setModulesDirect, makeDirty),
			setName: generateSetter(setNameDirect, makeDirty),
			setIcon: generateSetter(setIconDirect, makeDirty),
			setColor: generateSetter(setColorDirect, makeDirty),
			setTimestamp: generateSetter(setTimestampDirect, makeDirty),
			setRevokedAt: generateSetter(setRevokedAtDirect, makeDirty),
			setCustomNameEnabled: generateSetter(setCustomNameDirect, makeDirty),
			setExternalLink: generateSetter(setExternalLink, makeDirty),
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
			externalLink: string
			customNameEnabled: boolean
			revokedAt?: number | undefined
			extraFields: typeof event.extraFields
		}) => {
			setDirty(false)
			setters.setId(loadedState.id, { cleanSet: true })
			setters.setName(loadedState.name, { cleanSet: true })
			setters.setTimestamp(loadedState.timestamp, { cleanSet: true })
			setters.setIcon(loadedState.icon, { cleanSet: true })
			setters.setColor(loadedState.color, { cleanSet: true })
			setters.setExternalLink(loadedState.externalLink, { cleanSet: true })
			setters.setCustomNameEnabled(loadedState.customNameEnabled, { cleanSet: true })
			setters.setRevokedAt(loadedState.revokedAt, { cleanSet: true })
			setters.setModules(loadedState.extraFields, { cleanSet: true })
			setKey((prev) => prev + 1)
		},
		[event, setDirty, setters],
	)

	const loadEvent = useCallback(
		(event: WorldEvent) => {
			loadState({
				...event,
				customNameEnabled: event.customName,
			})
			currentId.current = event.id
		},
		[loadState],
	)

	useEffect(() => {
		setters.setTimestamp(event.timestamp, { cleanSet: true })
	}, [event.timestamp, setters])

	const toPayload = useCallback(() => {
		return {
			id,
			modules,
			name,
			icon,
			color,
			timestamp: String(timestamp),
			revokedAt: revokedAt ? String(revokedAt) : null,
			customNameEnabled: customName,
			externalLink,
		}
	}, [id, modules, name, icon, color, timestamp, revokedAt, customName, externalLink])

	if (currentId.current !== event.id) {
		loadEvent(event)
	}

	return {
		isDirty,
		key,
		id,
		modules,
		name,
		icon,
		color,
		timestamp,
		revokedAt,
		customNameEnabled: customName,
		externalLink,
		setDirty,
		bumpKey: () => setKey((prev) => prev + 1),
		...setters,
		loadState,
		loadEvent,
		toPayload,
	}
}
