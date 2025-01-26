import { Dispatch, useCallback, useMemo, useRef, useState } from 'react'

import { MentionDetails, WorldEvent } from '@/app/features/worldTimeline/types'

type Props = {
	event: WorldEvent
}

type SetterArgs = {
	cleanSet?: boolean
}

export const useEventFields = ({ event }: Props) => {
	const isDirty = useRef(false)
	const setDirty = useCallback((value: boolean) => (isDirty.current = value), [])

	const [modules, setModulesDirect] = useState<typeof event.extraFields>(event.extraFields)
	const [name, setNameDirect] = useState<string>(event.name)
	const [icon, setIconDirect] = useState<string>(event.icon)
	const [timestamp, setTimestampDirect] = useState<number>(event.timestamp)
	const [revokedAt, setRevokedAtDirect] = useState<number | undefined>(event.revokedAt)
	const [mentions, setMentionsDirect] = useState<MentionDetails[]>(event.mentions)
	const [description, setDescriptionDirect] = useState<string>(event.description)
	const [descriptionRich, setDescriptionRichDirect] = useState<string>(event.descriptionRich)
	const [customNameEnabled, setCustomNameEnabledDirect] = useState<boolean>(event.customName)

	const [externalLink, setExternalLink] = useState<string>(event.externalLink)

	const generateSetter = useCallback(<T,>(setter: Dispatch<React.SetStateAction<T>>) => {
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
	}, [])

	const setters = useMemo(
		() => ({
			setModules: generateSetter(setModulesDirect),
			setName: generateSetter(setNameDirect),
			setIcon: generateSetter(setIconDirect),
			setTimestamp: generateSetter(setTimestampDirect),
			setRevokedAt: generateSetter(setRevokedAtDirect),
			setMentions: generateSetter(setMentionsDirect),
			setDescription: generateSetter(setDescriptionDirect),
			setDescriptionRich: generateSetter(setDescriptionRichDirect),
			setCustomNameEnabled: generateSetter(setCustomNameEnabledDirect),
			setExternalLink: generateSetter(setExternalLink),
		}),
		[generateSetter],
	)

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
			customNameEnabled,
			externalLink,
			setDirty,
			...setters,
		},
	}
}
