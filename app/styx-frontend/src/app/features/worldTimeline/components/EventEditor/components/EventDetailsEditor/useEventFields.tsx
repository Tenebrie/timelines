import { useCallback, useMemo, useRef, useState } from 'react'

import { MentionDetails, WorldEvent } from '@/app/features/worldTimeline/types'
import { generateSetter } from '@/app/utils/autosave/generateSetter'

type Props = {
	event: WorldEvent
}

export const useEventFields = ({ event }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => {
		isDirty.current = value
	}, [])

	const [modules, setModulesDirect] = useState<typeof event.extraFields>(event.extraFields)
	const [name, setNameDirect] = useState<string>(event.name)
	const [icon, setIconDirect] = useState<string>(event.icon)
	const [timestamp, setTimestampDirect] = useState<number>(event.timestamp)
	const [revokedAt, setRevokedAtDirect] = useState<number | undefined>(event.revokedAt)
	const [mentions, setMentionsDirect] = useState<MentionDetails[]>(event.mentions)
	const [description, setDescriptionDirect] = useState<string>(event.description)
	const [descriptionRich, setDescriptionRichDirect] = useState<string>(event.descriptionRich)
	const [customName, setCustomNameDirect] = useState<boolean>(event.customName)

	const [externalLink, setExternalLink] = useState<string>(event.externalLink)

	const setters = useMemo(
		() => ({
			setModules: generateSetter(setModulesDirect, isDirty),
			setName: generateSetter(setNameDirect, isDirty),
			setIcon: generateSetter(setIconDirect, isDirty),
			setTimestamp: generateSetter(setTimestampDirect, isDirty),
			setRevokedAt: generateSetter(setRevokedAtDirect, isDirty),
			setMentions: generateSetter(setMentionsDirect, isDirty),
			setDescription: generateSetter(setDescriptionDirect, isDirty),
			setDescriptionRich: generateSetter(setDescriptionRichDirect, isDirty),
			setCustomNameEnabled: generateSetter(setCustomNameDirect, isDirty),
			setExternalLink: generateSetter(setExternalLink, isDirty),
		}),
		[],
	)

	const loadState = (loadedState: {
		name: string
		description: string
		descriptionRich: string
		timestamp: number
		icon: string
		mentions: MentionDetails[]
		externalLink: string
		customNameEnabled: boolean
		revokedAt?: number | undefined
		extraFields: typeof event.extraFields
	}) => {
		setDirty(false)
		setters.setName(loadedState.name, { cleanSet: true })
		setters.setDescription(loadedState.description, { cleanSet: true })
		setters.setDescriptionRich(loadedState.descriptionRich, { cleanSet: true })
		setters.setTimestamp(loadedState.timestamp, { cleanSet: true })
		setters.setIcon(loadedState.icon, { cleanSet: true })
		setters.setMentions(loadedState.mentions, { cleanSet: true })
		setters.setExternalLink(loadedState.externalLink, { cleanSet: true })
		setters.setCustomNameEnabled(loadedState.customNameEnabled, { cleanSet: true })
		setters.setRevokedAt(loadedState.revokedAt, { cleanSet: true })
		setters.setModules(loadedState.extraFields, { cleanSet: true })
	}

	const loadEvent = (event: WorldEvent) => {
		loadState({
			...event,
			customNameEnabled: event.customName,
		})
	}

	return {
		state: {
			isDirty,
			modules,
			name,
			icon,
			timestamp,
			revokedAt,
			mentions,
			description,
			descriptionRich,
			customNameEnabled: customName,
			externalLink,
			setDirty,
			...setters,
			loadState,
			loadEvent,
		},
	}
}
